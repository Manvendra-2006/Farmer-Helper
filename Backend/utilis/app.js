import express from 'express'
import cors from 'cors'
import router from './routes/cloudinary.js'
import cloudinary from 'cloudinary'
const app = express()
app.use(cors())
app.use(express.json({limit:"50mb"}))
app.use(express.urlencoded({extended:true,limit:"50mb"}))

const {CLOUD_NAME,CLOUD_API_KEY,CLOUD_SECRET_KEY} = process.env
if(!CLOUD_NAME||!CLOUD_API_KEY||!CLOUD_SECRET_KEY){
    throw new Error("All Cloudinary filds are required")
}
cloudinary.v2.config({
    cloud_name:CLOUD_NAME,
    api_key:CLOUD_API_KEY,
    api_secret:CLOUD_SECRET_KEY
})
app.use('/api/utilis/file',router)
export default app