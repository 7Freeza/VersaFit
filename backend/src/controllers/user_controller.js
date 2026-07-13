import { query } from '../config/db.js'

export async function getProfile(req, res) {
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

export async function updateProfile(req, res) {
    try {
        const userId = req.user.id
        const { name, weight, height, goal } = req.body

        const result = await query(
            'UPDATE users SET name = COALESCE($1, name), weight = COALESCE($2, weight), height = COALESCE($3, height), goal = COALESCE($4, goal) WHERE id = $5 RETURNING id, name, email, weight, height, goal, created_at',
            [name, weight, height, goal, userId]
        )

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' })
        }

        return res.status(200).json({
            message: 'Profile updated successfully',
            user: result.rows[0],
        })
    } catch (error) {
        console.error('Error in updateProfile:', error.message)
        return res.status(500).json({ message: 'Internal server error' })
    }
}