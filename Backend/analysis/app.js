import express from 'express'
import cors from 'cors'
import analysisRouter from './routes/analysis.routes.js'
import cookieParser from 'cookie-parser'
import referralRouter from './routes/referral.routes.js'
const app = express()
app.use(cors({
    origin:"https://farmer-helper-eta.vercel.app",
    credentials:true
}))
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use('/api/farmer',analysisRouter)
app.use('/api/admin',referralRouter)
export default app