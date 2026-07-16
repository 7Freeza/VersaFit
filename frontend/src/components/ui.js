/* Componentes de interfaz reutilizables: navbar, logo y chips */
import { isLightTheme, toggleTheme } from '../utils/theme.js'
import { getCurrentUser, isLoggedIn, logout } from '../auth.js'

export function logoMarkup(heightPx = 40) {
  const light = isLightTheme()
  const src = light
    ? '/assets/VersaFitLogoBlanco.png'
    : '/assets/VersaFitLogoOscuro.png'

  return `
    <div class="flex items-center">
      <img
        src="${src}"
        alt="VersaFit"
        class="w-auto object-contain logo-img"
        style="height:${heightPx}px; max-width: min(220px, 48vw);"
      />
    </div>
  `
}
/* Boton para cambiar entre tema claro y oscuro */
export function themeToggleButton() {
  const light = isLightTheme()
  return `
    <button type="button" data-action="toggle-theme" class="vf-btn-ghost text-sm py-2 px-3">
      ${light ? 'Modo oscuro' : 'Modo claro'}
    </button>
  `
}

export function bindThemeToggle(root = document) {
  root.querySelectorAll('[data-action="toggle-theme"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      toggleTheme()
      window.dispatchEvent(new CustomEvent('versafit:theme'))
    })
  })
}
