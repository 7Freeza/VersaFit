/* Dashboard con el plan semanal y las rutinas */
import { api } from '../api.js'
import { requireLogin, refreshSession, getCurrentUser } from '../auth.js'
import { showToast } from '../utils/toast.js'
import { validateWeight } from '../utils/validate.js'
import {
  topNav,
  bindThemeToggle,
  bindLogout,
  difficultyChip,
  categoryIcon,
  dayLabelEs,
  categoryLabelEs,
  statusLabelEs,
  escapeHtml,
} from '../components/ui.js'
/* Punto de entrada: valida sesion antes de armar el dashboard */
export async function renderDashboard(root, { navigate }) {
  if (!requireLogin(navigate)) return

  root.innerHTML = `
    <div class="vf-page min-h-screen">
      ${topNav({ active: 'exercise', logoSize: 48 })}
      <div class="max-w-6xl mx-auto px-4 md:px-8 py-8">
        <p class="text-[var(--vf-muted)]">Cargando dashboard...</p>
      </div>
    </div>
  `

  let category = 'all'
  let dashboard = null
  let motivation = null
  let sessionInfo = null
}