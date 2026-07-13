import { query } from '../config/db.js'

export async fuction getProfile(req, res) {
    try {
        const userId = req.user.userId
        const result = await query(
            'SELECT id, name, email, weight, height, goal, created_at FROM users WHERE id = $1',
            [userId]
        )

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' })
        }

        return res.status(200).json({ user: result.rows[0] })
    } catch (error) {
        console.error('Error in getProfile:', error.message)
        return res.status(500).json({ message: 'Internal server error' })
    }
}
