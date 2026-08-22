import mongoose from "mongoose";
export async function connectDb(){
    try{
        await mongoose.connect(process.env.MONGO_URL)
        console.log("✔️Database is connected successfully")
    }
    catch(error){
        console.log("Database is not connected successfully")
    }
}