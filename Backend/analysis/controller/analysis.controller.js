import getBuffer from "../config/datauri.js"
import axios from 'axios'
import Analysis from "../models/analysis.model.js"
import { AnalysisFarmerCropByAi } from "../services/ai.analysis.js"
export async function AnalysisController(req,resp){
    try{
        console.log("gggggggggggggggggggggggggggggggggggggggggggggggggggggggg")
        const {cropName,cropTypeUse,cropTypeSeason,latitude,longitude,soilType,growthStage,symptoms,affectedArea,description,formattedAddress} = req.body
        if(!cropName||!cropTypeUse||!cropTypeSeason||!latitude||!longitude||!soilType||!growthStage||!symptoms||!affectedArea||!description||!formattedAddress){
            return resp.status(400).json({message:"All Fields are required"})
        }
        const file = req.file
        if(!file){
            return resp.status(400).json({message:"File is required"})
        }
        console.log("Problem yaha se shuru")
        const datauri = getBuffer(file)
        if(!datauri){
            return resp.status(400).json({message:"File is not converted into DataURI"})
        }
          console.log("Problem yaha se shuru")
        const uploadFile = await axios.post("http://localhost:3000/api/utilis/file/upload",{buffer:datauri})
        console.log("fffffffff")
console.log("UPLOAD RESPONSE:", uploadFile.data)
        if(!uploadFile){
            return resp.status(400).json({message:"File is not uploaded"})
        }
        const photoURL = uploadFile.data.url
        console.log("fhggggggggggg",photoURL)
        // analysis kregenge
       const airesult=  await AnalysisFarmerCropByAi({photoURL,cropName,cropTypeUse,cropTypeSeason,latitude,longitude,soilType,growthStage,symptoms,affectedArea,description,formattedAddress} )
        const analysis = await Analysis.create({
            cropName,
            cropTypeUse,
            cropTypeSeason,
            soilType,
            growthStage,
            photoURL,
            symptoms,
            affectedArea,
            description,
            addLocation:{
                type:"Point",
                coordinates:[Number(longitude),Number(latitude)],
                formattedAddress
            }  ,
           aianalysis :airesult         
        })
        if(!analysis){
            return resp.status(400).json({message:"Analysis not done successfully"})
        }
        return resp.status(201).json({message:"Analysis done successfully",analysis})
    }
    catch(error){
        return resp.status(500).json({message:"Internal Server Error",error:error.message})
    }
}