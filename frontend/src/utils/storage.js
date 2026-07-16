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



