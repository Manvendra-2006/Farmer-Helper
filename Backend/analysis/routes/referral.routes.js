import express from 'express'
import { createReferralController, updateReferralStatusController, getReferralsByAnalysisController } from '../controller/referral.controller.js'
import { AuthMiddleware } from '../middleware/authmiddleware.js'

const referralRouter = express.Router()
referralRouter.post('/referral', AuthMiddleware, createReferralController)
referralRouter.patch('/referral/:id/status', AuthMiddleware, updateReferralStatusController)
referralRouter.get('/referral/analysis/:analysisId', AuthMiddleware, getReferralsByAnalysisController)

export default referralRouter