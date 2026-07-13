import { query } from '../config/db.js'

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
