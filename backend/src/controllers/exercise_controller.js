import * as exerciseModel from '../models/exercise.model.js'
import * as userModel from '../models/user.model.js'
import { generatePersonalizedPlan } from '../utils/planGenerator.js'
import { validateScheduleDay} from '../middleware/errorHandler.js'

function mappRoutine (row) {
  return {
    routineId: row.routine_id,
    planId: row.plan_id,
    name: row.name,
    description: row.description,
    category: row.category,
    difficulty: row.difficulty,
    durationMin: row.duration_min,
    estimateKcal: row.estimate_kcal,
  }
}

export async function getRoutines(req, res) {
    try {
        const userId = req.user.id

        const result = await query('SELECT id, name, description FROM routines WHERE user_id = $1', [userId])

        return res.status(200).json({ routines: result.rows })

    } catch (error) {
        console.error('Error in getRoutines:', error.message)
        return res.status(500).json({ message: 'Internal server error' })
    }
}

export async function createRoutine(req, res) {
    try {
        const userId = req.user.id
        const { name, description } = req.body

        if (!name) {
            return res.status(400).json({ message: 'Routine name is required' })
        }

        const result = await query(
            'INSERT INTO routines (user_id, name, description) VALUES ($1, $2, $3) RETURNING id, name, description',
            [userId, name, description || null]
        )

        return res.status(201).json({ 
            message: 'Routine created successfully', 
            routine: result.rows[0],
        })

    } catch (error) {
        console.error('Error in createRoutine:', error.message)
        return res.status(500).json({ message: 'Internal server error' })
    }
}

export async function updateRoutine(req, res) {
    try {
        const userId = req.user.id
        const routineId = req.params.id
        const { name, description } = req.body

        const result = await query(
            'UPDATE routines SET name = COALESCE($1, name), description = COALESCE($2, description) WHERE id = $3 AND user_id = $4 RETURNING id, name, description',
            [name, description, routineId, userId]
        )

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Routine not found' })
        }

        return res.status(200).json({ 
            message: 'Routine updated successfully', 
            routine: result.rows[0],
        })

    } catch (error) {
        console.error('Error in updateRoutine:', error.message)
        return res.status(500).json({ message: 'Internal server error' })
    }
}

export async function deleteRoutine(req, res) {
    try {
        const userId = req.user.id
        const routineId = req.params.id

        const result = await query(
            'DELETE FROM routines WHERE id = $1 AND user_id = $2 RETURNING id',
            [routineId, userId]
        )

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Routine not found' })
        }

        return res.status(200).json({ message: 'Routine deleted successfully' })
    } catch (error) {
        console.error('Error in deleteRoutine:', error.message)
        return res.status(500).json({ message: 'Internal server error' })
    }
}

export async function completeSession(req, res) {
    try {
        const userId = req.user.id
        const routineId = req.params.id

        const routineCheck = await query('SELECT id FROM routines WHERE id = $1 AND user_id = $2', [routineId, userId])

        if (routineCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Routine not found' })
        }

        const result = await query(
            'INSERT INTO sessions (user_id, routine_id, completed_at) VALUES ($1, $2, NOW()) RETURNING id, user_id, routine_id, completed_at',
            [userId, routineId]
        )

        return res.status(201).json({
            message: 'Session completed successfully',
            session: result.rows[0],
        })
    } catch (error) {
        console.error('Error in completeSession:', error.message)
        return res.status(500).json({ message: 'Internal server error' })
    }
}

export async function getSessions(req, res) {
    try {
        const userId = req.user.id

        const result = await query(
            'SELECT id, routine_id, completed_at FROM sessions WHERE user_id = $1 ORDER BY completed_at DESC',
            [userId]
        )
        return res.status(200).json({ sessions: result.rows })
    } catch (error) {
        console.error('Error in getSessions:', error.message)
        return res.status(500).json({ message: 'Internal server error' })
    }
}