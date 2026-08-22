import mongoose from "mongoose";
export async function connectDb(){
    try{
        await mongoose.connect(process.env.MOGO_URL)
        console.log("DataBase is  connected successfully")
    }
    catch(error){
        console.log("❌ DataBase is not connected successfully")
    }
}