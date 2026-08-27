import getBuffer from "../config/datauri.js"
import axios from 'axios'
import Analysis from "../models/analysis.model.js"
import { AnalysisFarmerCropByAi } from "../services/ai.analysis.js"
// import { testGemini } from "../services/ai.analysis.js"
export async function AnalysisController(req, resp) {
    try {
        const userId = req.user.data.user._id.toString()
        if (!userId) {
            return resp.status(400).json({ message: "All fields are required" })
        }
        const { cropName, cropTypeUse, cropTypeSeason, latitude, longitude, soilType, growthStage, symptoms, affectedArea, description, formattedAddress } = req.body
        if (!cropName || !cropTypeUse || !cropTypeSeason || !latitude || !longitude || !soilType || !growthStage || !symptoms || !affectedArea || !formattedAddress) {
            return resp.status(400).json({ message: "All Fields are required" })
        }
        const file = req.file
        if (!file) {
            return resp.status(400).json({ message: "File is required" })
        }
        console.log("Problem yaha se shuru")
        const datauri = getBuffer(file)
        if (!datauri) {
            return resp.status(400).json({ message: "File is not converted into DataURI" })
        }
        console.log("Problem yaha se shuru")
        const uploadFile = await axios.post("https://farmer-helper-4.onrender.com/api/utilis/file/upload", { buffer: datauri })
        if (!uploadFile) {
            return resp.status(400).json({ message: "File is not uploaded" })
        }
        const photoURL = uploadFile.data.url
        let district = formattedAddress || "Location detected";
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
                {
                    headers: {
                        "User-Agent": "FarmerHelp/1.0 (crop-analysis-service)",
                        Accept: "application/json"
                    }
                }
            );
            if (response.ok) {
                const data = await response.json();

                district =
                    data.address?.state_district ||
                    data.address?.county ||
                    data.address?.city ||
                    data.address?.town ||
                    data.address?.village ||
                    "Unknown";
                console.log("bhai ka mhaolla ", district)
            }
        } catch (geocodingError) {
            console.error("Reverse geocoding failed:", geocodingError.message);
        }
        const airesult = await AnalysisFarmerCropByAi({ photoURL, cropName, cropTypeUse, cropTypeSeason, latitude, longitude, soilType, growthStage, symptoms, affectedArea, description, formattedAddress })
        const analysis = await Analysis.create({
            cropName,
            district,
            userId,
            cropTypeUse,
            cropTypeSeason,
            soilType,
            growthStage,
            photoURL,
            symptoms,
            affectedArea,
            description: description || null,
            addLocation: {
                type: "Point",
                coordinates: [Number(longitude), Number(latitude)],
                formattedAddress
            },
            aianalysis: airesult
        })
        if (!analysis) {
            return resp.status(400).json({ message: "Analysis not done successfully" })
        }
        return resp.status(201).json({ message: "Analysis done successfully", analysis })
    }
    catch (error) {
        return resp.status(502).json({ message: "Crop analysis service failed", error: error.message })
    }
}
export async function getMyAnalysesController(req, resp) {
    try {
        const userId = req.user.data.user._id.toString()
        console.log("Farmer ki userId", userId)
        const myAnalyses = await Analysis.find({ userId: userId })
        console.log(myAnalyses)
        return resp.status(200).json({ message: "Your analyses fetched successfully", myAnalyses })
    }
    catch (error) {
        return resp.status(500).json({ message: "Internal Server Error", error: error.message })
    }
}
export async function getALlDistrictBasisAnalysis(req, resp) {
    try {

        const district = req.params?.district?.trim()
        if (!district) {
            return resp.status(400).json({ message: "District required" })
        }
        const districtData = await Analysis.find({
            district: district
        })
        if (districtData.length === 0) {
            return resp.status(200).json({ message: "Ecerything is good" })
        }
        return resp.status(200).json({ message: "District basis data analysis fetched successfully", districtData })
    }
    catch (error) {
        return resp.status(500).json({ message: "Internal Server Error", error: error.message })

    }
}

export async function getAnalysisById(req, resp) {
    try {
        const id = req.params.id
        if (!id) {
            return resp.status(400).json({ message: "Analysis Id is required" })
        }
        const analysisbyID = await Analysis.findOne({ _id: id })
        if (!analysisbyID) {
            return resp.status(400).json({ message: "No Analysis is exist with that ID" })
        }
        return resp.status(200).json({ message: "Analysis fetched Successfully", analysisbyID })
    }
    catch (error) {
        return resp.status(500).json({ message: "Internal Server Error", error: error.message })

    }
}

export async function updateAnalysisStatusController(req, resp) {
    try {
        const { id } = req.params
        const { status, officerNote } = req.body

        const ALLOWED_STATUSES = ["Pending Review", "Verified", "False Positive", "Action Taken", "Resolved"]
        if (!status || !ALLOWED_STATUSES.includes(status)) {
            return resp.status(400).json({ message: "Valid status is required", allowed: ALLOWED_STATUSES })
        }

        const analysis = await Analysis.findByIdAndUpdate(
            id,
            {
                status,
                officerNote: officerNote || null,
                reviewedBy: req.userId,
                reviewedAt: new Date()
            },
            { new: true }
        )

        if (!analysis) {
            return resp.status(404).json({ message: "No Analysis exists with that ID" })
        }

        return resp.status(200).json({ message: "Status updated successfully", analysis })
    }
    catch (error) {
        return resp.status(500).json({ message: "Internal Server Error", error: error.message })
    }
}
export async function scheduleFollowUpController(req, resp) {
    try {
        const { id } = req.params
        const { scheduledDate, notes } = req.body
        if (!scheduledDate) {
            return resp.status(400).json({ message: "scheduledDate is required" })
        }

        const analysis = await Analysis.findByIdAndUpdate(
            id,
            { $push: { followUps: { scheduledDate, notes: notes || null, createdBy: req.userId } } },
            { new: true }
        )

        if (!analysis) {
            return resp.status(404).json({ message: "Analysis not found" })
        }

        return resp.status(201).json({ message: "Follow-up scheduled successfully", analysis })
    }
    catch (error) {
        return resp.status(500).json({ message: "Internal Server Error", error: error.message })
    }
}

export async function completeFollowUpController(req, resp) {
    try {
        const { id, followupId } = req.params
        const { improvementStatus, outcomeNotes } = req.body

        const ALLOWED = ["Improved", "No Change", "Worsened"]
        if (!improvementStatus || !ALLOWED.includes(improvementStatus)) {
            return resp.status(400).json({ message: "Valid improvementStatus is required", allowed: ALLOWED })
        }

        const analysis = await Analysis.findOneAndUpdate(
            { _id: id, "followUps._id": followupId },
            {
                $set: {
                    "followUps.$.status": "Completed",
                    "followUps.$.improvementStatus": improvementStatus,
                    "followUps.$.outcomeNotes": outcomeNotes || null,
                    "followUps.$.completedAt": new Date()
                }
            },
            { new: true }
        )

        if (!analysis) {
            return resp.status(404).json({ message: "Follow-up not found" })
        }

        return resp.status(200).json({ message: "Follow-up marked complete", analysis })
    }
    catch (error) {
        return resp.status(500).json({ message: "Internal Server Error", error: error.message })
    }
}
function computeHeatStress({ tempC }) {
    let score = 0
    if (tempC >= 40) score = 3
    else if (tempC >= 35) score = 2
    else if (tempC >= 30) score = 1

    let level = "Low"
    if (score >= 3) level = "High"
    else if (score >= 2) level = "Moderate"
    return { score, level }
}

function heatStressReason(level, tempC) {
    if (level === "High") return `Extreme heat (${Math.round(tempC)}°C) — high risk of heat stress, wilting, and flower/fruit drop in sensitive crops.`
    if (level === "Moderate") return `Elevated temperature (${Math.round(tempC)}°C) — some heat stress possible in sensitive growth stages.`
    return `Temperature is within a safe range for most crops.`
}

function computeWaterStress({ rainMM, humidity, tempC }) {
    if (rainMM >= 20) return { score: 3, level: "High", direction: "Waterlogging" }
    if (rainMM >= 10) return { score: 2, level: "Moderate", direction: "Waterlogging" }

    let dryScore = 0
    if (humidity <= 30) dryScore += 2
    else if (humidity <= 45) dryScore += 1
    if (tempC >= 35) dryScore += 1
    if (rainMM === 0) dryScore += 1

    let level = "Low"
    if (dryScore >= 3) level = "High"
    else if (dryScore >= 2) level = "Moderate"

    return { score: dryScore, level, direction: "Drought" }
}

function waterStressReason(result, humidity, rainMM) {
    if (result.direction === "Waterlogging" && result.level !== "Low") {
        return `Heavy rainfall (${rainMM}mm) — risk of waterlogging and root stress, especially in low-lying/poorly-drained fields.`
    }
    if (result.level === "High") {
        return `Low humidity (${humidity}%) and no rainfall — high evapotranspiration demand, drought/moisture stress likely without irrigation.`
    }
    if (result.level === "Moderate") {
        return `Dry conditions — monitor soil moisture, irrigation may be needed soon.`
    }
    return `Moisture conditions are currently balanced.`
}
function computeInsectVectorRisk({ humidity, rainMM, tempC }) {
    let score = 0
    // Garam mausam insects ko active karta hai
    if (tempC >= 32) score += 3
    else if (tempC >= 27) score += 2
    else if (tempC >= 22) score += 1

    // Sookha mausam (kam humidity, kam baarish) insects ke liye favorable hai
    if (humidity <= 40) score += 2
    else if (humidity <= 55) score += 1

    if (rainMM === 0) score += 1 // baarish insects ko dhoti/kam karti hai

    let level = "Low"
    if (score >= 5) level = "High"
    else if (score >= 3) level = "Moderate"

    return { score, level }
}

function insectRiskReason(level, humidity, tempC) {
    if (level === "High") {
        return `Hot (${Math.round(tempC)}°C) and dry (${humidity}% humidity) conditions favor whitefly/aphid activity — elevated risk of viral disease spread (leaf curl) and insect/pest damage.`
    }
    if (level === "Moderate") {
        return `Moderately warm-dry conditions — some insect activity expected, keep monitoring for pest buildup.`
    }
    return `Current temperature/humidity are not particularly favorable for insect vector activity.`
}
function computeFungalRisk({ humidity, rainMM, tempC }) {
    let score = 0
    if (humidity >= 85) score += 3
    else if (humidity >= 70) score += 2
    else if (humidity >= 55) score += 1

    if (rainMM >= 10) score += 3
    else if (rainMM >= 2) score += 2
    else if (rainMM > 0) score += 1

    if (tempC >= 20 && tempC <= 30) score += 1

    let level = "Low"
    if (score >= 5) level = "High"
    else if (score >= 3) level = "Moderate"

    return { score, level }
}

function riskReason(level, humidity, rainMM) {
    if (level === "High") {
        return `High humidity (${humidity}%) with recent rainfall (${rainMM}mm) — strongly favorable for fungal disease spread (blast, rust, leaf spot). Advise close monitoring.`
    }
    if (level === "Moderate") {
        return `Moderate humidity (${humidity}%) — some fungal disease risk, keep watch on susceptible crops.`
    }
    return `Humidity (${humidity}%) and rainfall are currently low — fungal disease risk is minimal.`
} export async function getDistrictWeatherRiskController(req, resp) {
    try {
        const district = req.params?.district
        if (!district) {
            return resp.status(400).json({ message: "District required" })
        }
        if (!process.env.OPENWEATHER_API_KEY) {
            return resp.status(500).json({ message: "Weather API key not configured on server" })
        }

        const sample = await Analysis.find({ district }).limit(50)
        let lat, lon

        if (sample.length > 0) {
            lat = sample.reduce((sum, a) => sum + a.addLocation.coordinates[1], 0) / sample.length
            lon = sample.reduce((sum, a) => sum + a.addLocation.coordinates[0], 0) / sample.length
        } else {
            const geoRes = await axios.get("https://api.openweathermap.org/geo/1.0/direct", {
                params: { q: `${district},Chhattisgarh,IN`, limit: 1, appid: process.env.OPENWEATHER_API_KEY }
            })
            if (!geoRes.data?.[0]) {
                return resp.status(404).json({ message: "Could not locate district for weather lookup" })
            }
            lat = geoRes.data[0].lat
            lon = geoRes.data[0].lon
        }

        const weatherRes = await axios.get("https://api.openweathermap.org/data/2.5/weather", {
            params: { lat, lon, appid: process.env.OPENWEATHER_API_KEY, units: "metric" }
        })

        const w = weatherRes.data
        const humidity = w.main.humidity
        const tempC = w.main.temp
        const feelsLike = w.main.feels_like
        const tempMin = w.main.temp_min
        const tempMax = w.main.temp_max
        const pressure = w.main.pressure
        const rainMM = w.rain?.["1h"] || w.rain?.["3h"] || 0
        const windSpeed = w.wind?.speed || 0
        const windDeg = w.wind?.deg || 0
        const cloudCover = w.clouds?.all || 0
        const visibility = w.visibility
        const description = w.weather?.[0]?.description || ""
        const icon = w.weather?.[0]?.icon || ""
        const sunrise = w.sys?.sunrise ? new Date(w.sys.sunrise * 1000) : null
        const sunset = w.sys?.sunset ? new Date(w.sys.sunset * 1000) : null

        const { score, level } = computeFungalRisk({ humidity, rainMM, tempC })
        const reason = riskReason(level, humidity, rainMM)
        const insectRisk = computeInsectVectorRisk({ humidity, rainMM, tempC })
        const insectReason = insectRiskReason(insectRisk.level, humidity, tempC)
        const heatStress = computeHeatStress({ tempC })
        const waterStress = computeWaterStress({ rainMM, humidity, tempC })
        return resp.status(200).json({
            message: "Weather risk fetched successfully",
            district,
            coordinates: { lat, lon },
            humidity, temperature: tempC, feelsLike, tempMin, tempMax, pressure,
            rainfall: rainMM, windSpeed, windDeg, cloudCover, visibility,
            description, icon, sunrise, sunset,
            riskScore: score, riskLevel: level, reason,
            insectRiskLevel: insectRisk.level, insectReason,
            heatStressLevel: heatStress.level,
            heatStressReason: heatStressReason(heatStress.level, tempC),
            waterStressLevel: waterStress.level,
            waterStressDirection: waterStress.direction,
            waterStressReason: waterStressReason(waterStress, humidity, rainMM),
        })
    }
    catch (error) {
        return resp.status(500).json({ message: "Internal Server Error", error: error.message })
    }
}
export async function getDistrictWeatherForecastController(req, resp) {
    try {
        const district = req.params?.district
        if (!district) {
            return resp.status(400).json({ message: "District required" })
        }
        if (!process.env.OPENWEATHER_API_KEY) {
            return resp.status(500).json({ message: "Weather API key not configured on server" })
        }

        const sample = await Analysis.find({ district }).limit(50)
        let lat, lon
        if (sample.length > 0) {
            lat = sample.reduce((sum, a) => sum + a.addLocation.coordinates[1], 0) / sample.length
            lon = sample.reduce((sum, a) => sum + a.addLocation.coordinates[0], 0) / sample.length
        } else {
            const geoRes = await axios.get("https://api.openweathermap.org/geo/1.0/direct", {
                params: { q: `${district},Chhattisgarh,IN`, limit: 1, appid: process.env.OPENWEATHER_API_KEY }
            })
            if (!geoRes.data?.[0]) {
                return resp.status(404).json({ message: "Could not locate district for weather lookup" })
            }
            lat = geoRes.data[0].lat
            lon = geoRes.data[0].lon
        }

        const forecastRes = await axios.get("https://api.openweathermap.org/data/2.5/forecast", {
            params: { lat, lon, appid: process.env.OPENWEATHER_API_KEY, units: "metric" }
        })

        const points = forecastRes.data.list.map((item) => {
            const humidity = item.main.humidity
            const tempC = item.main.temp
            const rainMM = item.rain?.["3h"] || 0
            const windSpeed = item.wind?.speed || 0

            const fungal = computeFungalRisk({ humidity, rainMM, tempC })
            const insect = computeInsectVectorRisk({ humidity, rainMM, tempC })
            const heat = computeHeatStress({ tempC })
            const water = computeWaterStress({ rainMM, humidity, tempC })

            return {
                dateTime: item.dt_txt,
                humidity, temperature: tempC, rainfall: rainMM, windSpeed,
                description: item.weather?.[0]?.description || "",
                riskScore: fungal.score, riskLevel: fungal.level,
                insectRiskLevel: insect.level,
                heatStressLevel: heat.level,
                waterStressLevel: water.level,
                waterStressDirection: water.direction
            }
        })

        return resp.status(200).json({ message: "Forecast fetched successfully", district, points })
    }
    catch (error) {
        return resp.status(500).json({ message: "Internal Server Error", error: error.message })
    }
}
export async function getDueFollowUpsController(req, resp) {
    try {
        const district = req.params?.district
        if (!district) {
            return resp.status(400).json({ message: "District required" })
        }

        const today = new Date()
        today.setHours(23, 59, 59, 999)

        const analyses = await Analysis.find({
            district,
            followUps: { $elemMatch: { status: "Scheduled", scheduledDate: { $lte: today } } }
        })

        return resp.status(200).json({ message: "Due follow-ups fetched successfully", analyses })
    }
    catch (error) {
        return resp.status(500).json({ message: "Internal Server Error", error: error.message })
    }
}