import getBuffer from "../config/datauri.js"
import axios from 'axios'
import Analysis from "../models/analysis.model.js"
import { AnalysisFarmerCropByAi } from "../services/ai.analysis.js"
// import { testGemini } from "../services/ai.analysis.js"
export async function AnalysisController(req, resp) {
    try {
        const userId = req.user._id
        if(!userId){
            return resp.status(400).json({message:"All fields are required"})
        }
        const { cropName, cropTypeUse, cropTypeSeason, latitude, longitude, soilType, growthStage, symptoms, affectedArea, description, formattedAddress } = req.body
        if (!cropName || !cropTypeUse || !cropTypeSeason || !latitude || !longitude || !soilType || !growthStage || !symptoms || !affectedArea || !description || !formattedAddress) {
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
        const uploadFile = await axios.post("http://localhost:3000/api/utilis/file/upload", { buffer: datauri })
        if (!uploadFile) {
            return resp.status(400).json({ message: "File is not uploaded" })
        }
        const photoURL = uploadFile.data.url
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
        );
        const data = await response.json();
        const district = data.address?.city || data.address?.town || data.address?.county || "Location detected";
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
            description,
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
        return resp.status(500).json({ message: "Internal Server Error", error: error.message })
    }
}

export async function getALlDistrictBasisAnalysis(req,resp){
    try{

        const district = req.params?.district
        if(!district){
            return resp.status(400).json({message:"District required"})
        }
        const districtData = await Analysis.find({district:district})
        if(districtData.length === 0){
            return resp.status(200).json({message:"Ecerything is good"})
        }
        return resp.status(200).json({message:"District basis data analysis fetched successfully",districtData})
    }
    catch(error){
  return resp.status(500).json({ message: "Internal Server Error", error: error.message })
  
    }
}

export async function getAnalysisById(req,resp){
    try{
        const id = req.params.id
        if(!id){
            return resp.status(400).json({message:"Analysis Id is required"})
        }
        const analysisbyID = await Analysis.findOne({_id:id})
        if(!analysisbyID){
            return resp.status(400).json({message:"No Analysis is exist with that ID"})
        }
        return resp.status(200).json({message:"Analysis fetched Successfully",analysisbyID})
    }
    catch(error){
        return resp.status(500).json({ message: "Internal Server Error", error: error.message })
  
    }
}