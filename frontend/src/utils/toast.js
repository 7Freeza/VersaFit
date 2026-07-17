/* Muestra notificaciones flotantes que desaparecen solas */

export function showToast(message, type = 'info') {
  const root = document.getElementById('toast-root')
  if (!root) return

  const el = document.createElement('div')
  el.className = `toast ${type}`
  el.textContent = message
  root.appendChild(el)

  setTimeout(() => {
    el.style.opacity = '0'
    el.style.transition = 'opacity 0.25s ease'
    setTimeout(() => el.remove(), 250)
  }, 2800)
}
