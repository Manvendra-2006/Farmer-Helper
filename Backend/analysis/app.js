import express from 'express'
import cors from 'cors'
import analysisRouter from './routes/analysis.routes.js'
const app = express()
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
}))
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use('/api/farmer',analysisRouter)
export default app