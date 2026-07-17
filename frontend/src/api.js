/* Cliente HTTP para conectar con el backend */
import { getToken, clearSession } from './utils/storage.js'

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }

  const token = getToken()
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`/api${path}`, {
    ...options,
    headers,
  })
/* Procesa la respuesta y maneja errores del servidor*/
  let data = null
  const text = await response.text()
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = { message: text }
    }
  }

  if (response.status === 401) {
    clearSession()
  }

  if (!response.ok) {
    const error = new Error(data?.message || 'Request failed')
    error.status = response.status
    error.details = data?.details
    throw error
  }

  return data
}