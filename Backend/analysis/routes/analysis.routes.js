import express from 'express'
import { AnalysisController } from '../controller/analysis.controller.js'
import uploadFile from '../middleware/multer.middleware.js'
const analysisRouter  = express.Router()
analysisRouter.post("/analysis",uploadFile,AnalysisController)

export default analysisRouter