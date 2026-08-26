import mongoose from "mongoose";
const analysisSchema = mongoose.Schema({
    cropName:{
        type:String,
        required:true
    },
    photoURL:{
        type:String,
        required:true
    },
    cropTypeUse:{
        type:String,
        enum:["Food","Fodder","Fiber","Oilseed","Commercial","Other"],
        default:null
    },
    cropTypeSeason:{
        type:String,
        enum:["Kharif","Rabi","Zaid","Summer","Winter","Other"],
        default:null
    },
    addLocation:{
        type:{
            type:String,
            enum:["Point"],
            required:true
        },
        coordinates:{
            type:[Number],
            required:true
        },
        formattedAddress:{
            type:String,
            required:true
        }
    },
    soilType:{
        type:String,
        enum:["Sandy","Clay","Loamy","Black Soil","Red Soil","Alluvial","Laterite","Other","Don't Know"],
        default:null
    },
    growthStage:{
        type:String,
        enum:["Seedling","Vegetative","Flowering","Fruiting","Grain Formation","Maturity","Harvest","Don't Know"],
        default:null
    },
    symptoms:{
        type:String,
        default:null
    },
    affectedArea:{
        type:String,
        enum:["One plant","Few plants","Small area","Large area","Most of the field","Entire field"],
        required:true
    },
    description:{
        type:String,
        maxlength:1000,
        trim:true,
        default:null
    },
    aianalysis:{
        type:Object,
        required:true
    },
    userId:{
        type:String,
        required:true
    },
    district:{
        type:String,
        required:true
    },
    status: {
    type: String,
    enum: ["Pending Review", "Verified", "False Positive", "Action Taken", "Resolved"],
    default: "Pending Review"
},
officerNote: {
    type: String,
    default: null
},
reviewedBy: {
    type:"String",
    default: null
},
reviewedAt: {
    type: Date,
    default: null
},
followUps: [{
    scheduledDate: { type: Date, required: true },
    status: { type: String, enum: ["Scheduled", "Completed", "Missed"], default: "Scheduled" },
    notes: { type: String, default: null },
    improvementStatus: { type: String, enum: ["Improved", "No Change", "Worsened"], default: null },
    outcomeNotes: { type: String, default: null },
    completedAt: { type: Date, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdAt: { type: Date, default: Date.now }
}],
},{
    timestamps:true
})
analysisSchema.index({addLocation:"2dsphere"})
export default mongoose.model("Analysis",analysisSchema)