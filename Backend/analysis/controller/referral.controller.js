import Referral from "../models/Referral.model.js" // apna actual path daalo
import Analysis from "../models/analysis.model.js"  // apna actual path daalo

export async function createReferralController(req, resp) {
    try {
        const { analysisId, type, assigneeName, assigneeContact, dueDate, notes } = req.body
        if (!analysisId || !type || !assigneeName || !dueDate) {
            return resp.status(400).json({ message: "analysisId, type, assigneeName and dueDate are required" })
        }

        const analysisExists = await Analysis.findById(analysisId)
        if (!analysisExists) {
            return resp.status(404).json({ message: "Analysis not found" })
        }
        const createdBy = analysisExists._id
        const referral = await Referral.create({
            analysisId,
            type,
            assigneeName,
            assigneeContact,
            dueDate,
            notes,
            createdBy
        })

        return resp.status(201).json({ message: "Referral created successfully", referral })
    }
    catch (error) {
        return resp.status(500).json({ message: "Internal Server Error", error: error.message })
    }
}

export async function updateReferralStatusController(req, resp) {
    try {
        const { id } = req.params
        const { status } = req.body
        const ALLOWED = ["Pending", "In Progress", "Completed", "Cancelled"]
        if (!status || !ALLOWED.includes(status)) {
            return resp.status(400).json({ message: "Valid status is required", allowed: ALLOWED })
        }

        const update = { status }
        if (status === "Completed") update.completedAt = new Date()

        const referral = await Referral.findByIdAndUpdate(id, update, { new: true })
        if (!referral) {
            return resp.status(404).json({ message: "Referral not found" })
        }

        return resp.status(200).json({ message: "Referral status updated", referral })
    }
    catch (error) {
        return resp.status(500).json({ message: "Internal Server Error", error: error.message })
    }
}

export async function getReferralsByAnalysisController(req, resp) {
    try {
        const { analysisId } = req.params
        const referrals = await Referral.find({ analysisId }).sort({ createdAt: -1 })
        return resp.status(200).json({ message: "Referrals fetched successfully", referrals })
    }
    catch (error) {
        return resp.status(500).json({ message: "Internal Server Error", error: error.message })
    }
}