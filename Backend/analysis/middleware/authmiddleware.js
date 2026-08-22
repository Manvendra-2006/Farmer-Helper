import express from 'express'
import jwt, { decode } from 'jsonwebtoken'
export async function AuthMiddleware(req,resp,next){
    try{
        const token = req.cookies?.token || req.headers.authorization?.split(" ")[1]
        if(!token){
            return resp.status(404).json({message:"Token Required"})
        }
        const decoded = jwt.verify(token,process.env.JWT_TOKEN)
        if(!decoded){
            return resp.status(404).json({message:"Token is expired"})
        }
        const user = await axios.get(`http://localhost:1000/api/auth/internal-api/${decoded.UserExists._id}`,{
            headers:{
                "x-internal-key":process.env.INTERNAL_API_KEY
            }
        })
        if(!user){
            return resp.status(401).json({message:"Unauthorized User"})
        }
        req.user = user
        next()
    }
    catch(error){
        return resp.status(500).json({message:"Internal Server Error",error:error.message})
    }
}