import User from "../models/auth.model.js"
import jwt from 'jsonwebtoken'
import BlackList from "../models/blacklist.model.js"
export async function CreateUser(req, resp) {
    try {
        const { displayName, email, uid, photoURL, firstName, lastName } = req.body
        if (!displayName || !email || !uid || !photoURL || !firstName || !lastName) {
            return resp.status(400).json({ message: "All Fields are required" })
        }
        let UserExists = await User.findOne({ email, uid })
        if (UserExists) {
            const token = jwt.sign(
                { UserExists },
                process.env.JWT_TOKEN,
                { expiresIn: "7d" }
            )
            resp.cookie("token", token, {
                httpOnly: true,
                secure: false,
                sameSite: true,
                maxAge: 7 * 24 * 60 * 60 * 1000
            })
            return resp.status(200).json({ message: "User Sign-In ", UserExists })
        }

        UserExists = await User.create({
            displayName,
            email,
            uid,
            photoURL,
            firstName,
            lastName
        })
        const token = jwt.sign(
            { UserExists },
            process.env.JWT_TOKEN,
            { expiresIn: "7d" }
        )
        resp.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: true,
            maxAge: 7 * 24 * 60 * 60 * 1000
        })
        return resp.status(201).json({ message: "User is created successfully", UserExists })
    }
    catch (error) {
        return resp.status(500).json({ message: "Internal Server Error", error: error.message })
    }
}
export async function FetchUser(req, resp) {
    try {
        const token = req.headers.authorization?.split(" ")[1] || req.cookies?.token
        if (!token) {
            return resp.status(400).json({ message: "TOken is required" })
        }
        const userData = req.user
        if (!userData) {
            return resp.status(404).json({ message: "User is Unauthorized" })
        }
        const UserData = await User.findById(userData._id)
        if (!UserData) {
            return resp.status(404).json({ message: "User is Unauthorized" })
        }
        return resp.status(200).json({ message: "User Data Fetched successfully", UserData })
    }
    catch (error) {
        return resp.status(500).json({ message: "Internal Server Error", error: error.message })

    }
}

export async function logout(req,resp) {
    try {
        const token = req.headers.authorization?.split(" ")[1] || req.cookies?.token
        if (!token) {
            return resp.status(400).json({ message: "TOken is required" })
        }
        const userData = req.user
        if (!userData) {
            return resp.status(404).json({ message: "User is Unauthorized" })
        }
        const blacklist = await BlackList.create({
            userId:userData._id,
            token
        })
        resp.clearCookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: true,
            maxAge: 7 * 24 * 60 * 60 * 1000
        })
        return resp.status(200).json({ message: "User logout successfully" })
    }
    catch (error) {
        return resp.status(500).json({ message: "Internal Server Error", error: error.message })

    }
}

export async function RoleController(req,resp){
    try{
        const {role} = req.body
          const token = req.headers.authorization?.split(" ")[1] || req.cookies?.token
        if (!token) {
            return resp.status(400).json({ message: "TOken is required" })
        }
        const userData = req.user
        if (!userData) {
            return resp.status(404).json({ message: "User is Unauthorized" })
        }
        const roleChange = await User.findByIdAndUpdate(userData._id,{role:role},{returnDocument: 'after',runValidators:true}) // iska mtlb updated schema validation change karo 
          const tokenRole = jwt.sign(
            { roleChange },
            process.env.JWT_TOKEN,
            { expiresIn: "7d" }
        )
        resp.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: true,
            maxAge: 7 * 24 * 60 * 60 * 1000
        })
        return resp.status(200).json({message:"Role updated successfully",roleChange})
    }   
    catch(error){
      return resp.status(500).json({ message: "Internal Server Error", error: error.message })
    }
}