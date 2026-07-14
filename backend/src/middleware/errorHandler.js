/**
 * Central error handling so the server does not crash on unexpected errors.
 */

export function notFoundHandler(_req, res) {
  res.status(404).json({ message: 'Route not found' })
}

export function errorHandler(error, _req, res, _next) {
  console.error('[Error]', error.message)

  const status = error.status || 500
  const message =
    status === 500
      ? 'Internal server error'
      : error.message || 'Something went wrong'

  res.status(status).json({
    message,
    details: error.details || undefined,
  })
}

/**
 * Helper to create an HTTP error with status code.
 */
export function createError(status, message, details) {
  const error = new Error(message)
  error.status = status
  error.details = details
  return error
}