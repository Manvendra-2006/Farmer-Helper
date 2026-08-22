import jwt from 'jsonwebtoken'
import User from "../models/auth.model.js"
import BlackList from '../models/blacklist.model.js'
export async function AuthMiddleware(req,resp,next){
    try{
        const token = req.headers.authorization?.split(" ")[1] || req.cookies?.token
        if(!token){
            return resp.status(400).json({message:"TOken is required"})
        }
        console.log(token)
        const decoded = jwt.verify(token,process.env.JWT_TOKEN)
        if(!decoded){
            return resp.status(400).json({message:"User is not decoded"})
        }
        const blacklist = await BlackList.findOne({token})
        if(blacklist){
            return resp.status(200).json({message:"Token is blacklisted"})
        }
        const user = await User.findById(decoded.UserExists._id)
        if(!user){         
        return resp.status(404).json({message:"User is Unauthorized"})        
        }
        req.user = user
        next()
    }
    catch(error){
     return resp.status(500).json({ message: "Internal Server Error", error: error.message })
    }
}