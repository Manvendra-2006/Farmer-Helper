import mongoose from "mongoose";

const referralSchema = new mongoose.Schema({
    analysisId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Analysis",
        required: true
    },
    type: {
        type: String,
        enum: ["Lab Referral", "Field Visit"],
        required: true
    },
    assigneeName: {
        type: String,
        required: true,
        trim: true
    },
    assigneeContact: {
        type: String,
        default: null,
        trim: true
    },
    dueDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ["Pending", "In Progress", "Completed", "Cancelled"],
        default: "Pending"
    },
    notes: {
        type: String,
        default: null,
        trim: true
    },
    createdBy: {
        type:mongoose.Schema.Types.ObjectId,
        ref:"Analysis",
        required:true
    },
    completedAt: {
        type: Date,
        default: null
    }
}, { timestamps: true })

export default mongoose.model("Referral", referralSchema)