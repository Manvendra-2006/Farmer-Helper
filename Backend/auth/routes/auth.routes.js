import express from 'express'
import { CreateUser, DistrictController, FetchUser, InternalAPIController, logout, RoleController } from '../controller/authController.js'
import { AuthMiddleware } from '../Middleware/auth.middleware.js'
const authRouter = express.Router()
authRouter.post("/create-user",CreateUser)
authRouter.get("/account",AuthMiddleware,FetchUser)
authRouter.get("/logout",AuthMiddleware,logout)
authRouter.patch('/role-update',AuthMiddleware,RoleController)
authRouter.get('/internal-api/:id',InternalAPIController)
authRouter.patch("/district-update",AuthMiddleware,DistrictController)
export default authRouter