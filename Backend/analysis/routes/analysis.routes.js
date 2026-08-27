import express from 'express'
import { AnalysisController,getDueFollowUpsController, getALlDistrictBasisAnalysis, getMyAnalysesController,getAnalysisById ,updateAnalysisStatusController,scheduleFollowUpController,completeFollowUpController,getDistrictWeatherRiskController,getDistrictWeatherForecastController} from '../controller/analysis.controller.js'
import uploadFile from '../middleware/multer.middleware.js'
import { AuthMiddleware } from '../middleware/authmiddleware.js'
const analysisRouter  = express.Router()
analysisRouter.post("/analysis",uploadFile,AuthMiddleware,AnalysisController)
analysisRouter.get('/district-data/:district',AuthMiddleware,getALlDistrictBasisAnalysis)
analysisRouter.get('/district/analysis/:id',AuthMiddleware,getAnalysisById)
analysisRouter.patch('/analysis/:id/status', AuthMiddleware, updateAnalysisStatusController)
analysisRouter.post('/analysis/:id/followup', AuthMiddleware, scheduleFollowUpController)
analysisRouter.patch('/analysis/:id/followup/:followupId', AuthMiddleware, completeFollowUpController)
analysisRouter.get('/weather-risk/:district', AuthMiddleware, getDistrictWeatherRiskController)
analysisRouter.get('/weather-forecast/:district', AuthMiddleware, getDistrictWeatherForecastController)
analysisRouter.get('/analysis/mine', AuthMiddleware, getMyAnalysesController)
analysisRouter.get('/followups/due/:district', AuthMiddleware, getDueFollowUpsController)
export default analysisRouter