/**
 * JWT authentication middleware.
 * Expects header: Authorization: Bearer <token>
 */

import jwt from 'jsonwebtoken'

export function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization

    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required' })
    }

    const token = header.slice(7)
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret')

    req.user = {
      userId: payload.userId,
      email: payload.email,
    }

    next()
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' })
  }
}