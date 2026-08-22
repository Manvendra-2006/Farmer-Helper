import express from 'express'
import cloudinary from 'cloudinary'
const router = express.Router()
router.post('/upload',async (req,resp)=>{
    console.log("yha aproblem")
    const {buffer} = req.body
    if(!buffer){
        return resp.status(404).json({message:"File Data is required"})
    }
    console.log("prolbiem2222")
    const cloud = await cloudinary.v2.uploader.upload(buffer)
    console.log("fhfjffhfnhnf",cloud)
    resp.json({url:cloud.secure_url})

})
export default router