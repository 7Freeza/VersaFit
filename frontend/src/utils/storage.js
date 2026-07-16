const TOKEN_KEY = 'versafit_token'
const THEME_KEY = 'versafit_theme'
const USER_KEY = 'versafit_user'

export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
    localStorage.removeItem(TOKEN_KEY)
}

export function getStoredUser() {
    const raw = localStorage.getItem(USER_KEY)
    if (!raw) return null
    try {
        return JSON.parse(raw)
    } catch {
        return null
    }
}

export function setStoredUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearStoredUser() {
    localStorage.removeItem(USER_KEY)
}

export function getTheme() {
    return localStorage.getItem(THEME_KEY)  || 'dark'
}

export function setTheme(theme) {
    localStorage.setItem(THEME_KEY, theme)
}

export function clearSession() {
    clearToken()
    clearStoredUser()
}
