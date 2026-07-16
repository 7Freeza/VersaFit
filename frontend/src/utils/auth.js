/* Guarda la sesion y consulta el usuario actual — commit: feat: guarda la sesion y consulta el usuario actual */
import {
  getToken,
  setToken,
  getStoredUser,
  setStoredUser,
  clearSession,
} from './utils/storage.js'
import { api } from './api.js'

export function isLoggedIn() {
  return Boolean(getToken())
}

export function getCurrentUser() {
  return getStoredUser()
}

export function saveSession(token, user) {
  setToken(token)
  setStoredUser(user)
}

export function logout() {
  clearSession()
}

export async function refreshSession() {
  if (!getToken()) {
    return null
  }

  try {
    const data = await api.me()
    setStoredUser(data.user)
    return data
  } catch {
    clearSession()
    return null
  }
}

/* Protege rutas que requieren sesion activa — commit: feat: proteccion de rutas privadas */
export function requireLogin(navigate) {
  if (!isLoggedIn()) {
    navigate('/login')
    return false
  }
  return true
}
