import { Router } from 'express'
import * as exerciseController from '../controllers/exercise_controller.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.use(requireAuth)

router.get('/dashboard', exerciseController.getDashboard)
router.get('/motivation', exerciseController.getMotivation)
router.get('/routines/:routineId', exerciseController.getRoutineDetail)

export default router