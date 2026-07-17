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
/* Metodos del cliente para cada endpoint del backend*/
export const api = {
  register(body) {
    return request('/auth/register', { method: 'POST', body: JSON.stringify(body) })
  },
  login(body) {
    return request('/auth/login', { method: 'POST', body: JSON.stringify(body) })
  },
  me() {
    return request('/auth/me')
  },
  objectives() {
    return request('/users/objectives')
  },
  updateProfile(body) {
    return request('/users/profile', { method: 'PUT', body: JSON.stringify(body) })
  },
  completeOnboarding(body) {
    return request('/users/onboarding', { method: 'POST', body: JSON.stringify(body) })
  },
  addWeight(weightKg) {
    return request('/users/weight', {
      method: 'POST',
      body: JSON.stringify({ weightKg }),
    })
/* Guarda el peso del usuario */
  },
  weightHistory() {
    return request('/users/weight')
  },
  exerciseDashboard(category = 'all') {
    const query = category && category !== 'all' ? `?category=${encodeURIComponent(category)}` : ''
    return request(`/exercise/dashboard${query}`)
  },
  routineDetail(routineId) {
    return request(`/exercise/routines/${routineId}`)
  },
  updateSchedule(body) {
    return request('/exercise/schedule', { method: 'PUT', body: JSON.stringify(body) })
  },
  startRoutine(routineId) {
    return request(`/exercise/routines/${routineId}/start`, { method: 'POST' })
  },
  toggleExercise(sessionId, exerciseId, isDone) {
    return request(`/exercise/sessions/${sessionId}/exercises/${exerciseId}`, {
      method: 'PATCH',
      body: JSON.stringify({ isDone }),
    })
  },
  regeneratePlan() {
    return request('/exercise/generate-plan', { method: 'POST' })
  },
  motivation() {
    return request('/exercise/motivation')
  },
}
