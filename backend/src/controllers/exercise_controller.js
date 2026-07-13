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