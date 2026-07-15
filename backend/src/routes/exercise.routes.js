import { Router } from 'express'
import * as exerciseController from '../controllers/exercise_controller.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.use(requireAuth)

router.get('/dashboard', exerciseController.getDashboard)
router.get('/motivation', exerciseController.getMotivation)
router.get('/routines/:routineId', exerciseController.getRoutineDetail)
router.put('/schedule', exerciseController.updateSchedule)
router.post('/routines/:routineId/start', exerciseController.startRoutine)
router.patch(
  '/sessions/:sessionId/exercises/:exerciseId',
  exerciseController.toggleExercise
)
router.post('/generate-plan', exerciseController.regeneratePlan)

export default router