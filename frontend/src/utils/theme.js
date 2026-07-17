/**
 * Dark / light theme helpers.
 */

import { getTheme, setTheme } from './storage.js'

export function applyTheme(theme) {
  const next = theme === 'light' ? 'light' : 'dark'
  document.documentElement.classList.toggle('light', next === 'light')
  setTheme(next)
  return next
}

export function initTheme() {
  return applyTheme(getTheme())
}

export function toggleTheme() {
  const current = getTheme()
  return applyTheme(current === 'light' ? 'dark' : 'light')
}

export function isLightTheme() {
  return getTheme() === 'light'
}
