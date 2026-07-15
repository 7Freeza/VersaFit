import { Router } from 'express'
import * as userController from '../controllers/user_controller.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.use(requireAuth)

router.get('/objectives', userController.listObjectives)
router.put('/profile', userController.updateProfile)
router.post('/onboarding', userController.completeOnboarding)
router.post('/weight', userController.addWeight)
router.get('/weight', userController.weightHistory)

export default router