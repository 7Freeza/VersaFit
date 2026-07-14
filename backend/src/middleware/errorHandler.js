/**
 * Central error handling so the server does not crash on unexpected errors.
 */

export function notFoundHandler(_req, res) {
  res.status(404).json({ message: 'Route not found' })
}