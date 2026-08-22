import mongoose from "mongoose";
const blacklistSchema = mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    token:{
        type:String,
        required:true
    }
},{
    timestamps:true
})
export default mongoose.model("BlackList",blacklistSchema)