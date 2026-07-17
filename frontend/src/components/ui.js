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
/* Barra de navegacion superior — commit: feat: barra de navegacion superior */
export function topNav({ active = 'home', showAuth = true, logoSize = 44 } = {}) {
  const logged = isLoggedIn()
  const user = getCurrentUser()

  return `
    <header class="flex items-center justify-between gap-4 px-4 md:px-8 py-4 border-b border-[var(--vf-border)]">
      <a href="#/" class="flex items-center no-underline text-[var(--vf-text)]">
        ${logoMarkup(logoSize)}
      </a>

      <nav class="hidden md:flex items-center gap-6 text-sm text-[var(--vf-muted)]">
        <a href="#/" class="${active === 'home' ? 'text-[var(--vf-text)] font-semibold' : ''}">Inicio</a>
        <a href="#/dashboard" class="${active === 'exercise' ? 'text-[var(--vf-text)] font-semibold' : ''}">Rutinas</a>
        <span class="opacity-50 cursor-not-allowed">Nutricion</span>
        <span class="opacity-50 cursor-not-allowed">Progreso</span>
      </nav>

      <div class="flex items-center gap-2">
        ${themeToggleButton()}
        ${
          showAuth
            ? logged
              ? `
                <span class="hidden sm:inline text-sm text-[var(--vf-muted)]">Hola, ${escapeHtml(user?.fullName || '')}</span>
                <button type="button" data-action="logout" class="vf-btn-ghost text-sm py-2">Salir</button>
                <a href="#/dashboard" class="vf-btn-primary text-sm py-2">Dashboard</a>
              `
              : `<a href="#/login" class="vf-btn-primary text-sm py-2">Iniciar sesion</a>`
            : ''
        }
      </div>
    </header>
  `
}
/* Cierra sesion y escapa texto para html */
export function bindLogout(navigate) {
  document.querySelectorAll('[data-action="logout"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      logout()
      navigate('/')
    })
  })
}

export function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}
/* Etiqueta de dificultad e icono de categoria*/
export function difficultyChip(difficulty) {
  const labelMap = {
    beginner: 'Principiante',
    intermediate: 'Intermedio',
    advanced: 'Avanzado',
    'all levels': 'Todos los niveles',
  }
  const label = labelMap[difficulty] || difficulty || 'General'
  const advanced = difficulty === 'advanced' ? 'advanced' : ''
  return `<span class="vf-chip ${advanced}">${escapeHtml(label)}</span>`
}

export function categoryIcon(category) {
  const map = {
    strength: '💪',
    cardio: '🏃',
    hiit: '⚡',
  }
  return map[category] || '🏋️'
}

/* Traduce dias y categorias al español*/
export function dayLabelEs(dayName) {
  const map = {
    Monday: 'Lun',
    Tuesday: 'Mar',
    Wednesday: 'Mie',
    Thursday: 'Jue',
    Friday: 'Vie',
    Saturday: 'Sab',
    Sunday: 'Dom',
  }
  return map[dayName] || dayName
}

export function categoryLabelEs(category) {
  const map = {
    strength: 'Fuerza',
    cardio: 'Cardio',
    hiit: 'HIIT',
  }
  return map[category] || category || 'Descanso'
}
/* Etiqueta de estado de la rutina */
export function statusLabelEs(status) {
  const map = {
    complete: 'Completo',
    incomplete: 'Incompleto',
    pending: 'Pendiente',
    upcoming: 'Proximo',
    rest: 'Descanso',
  }
  return map[status] || status
}
