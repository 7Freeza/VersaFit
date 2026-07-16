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
/* Carga los datos del dashboard y la frase motivacional */
  try {
    sessionInfo = await refreshSession()
    ;[dashboard, motivation] = await Promise.all([
      api.exerciseDashboard(category),
      api.motivation().catch(() => ({
        quote: 'Disciplina hoy, fuerza siempre.',
        author: 'VersaFit',
      })),
    ])
  } catch (error) {
    root.querySelector('.max-w-6xl').innerHTML = `
      <p class="text-[var(--vf-danger)]">${escapeHtml(error.message)}</p>
      <button class="vf-btn-primary mt-4" data-go-onboarding>Completar perfil</button>
    `
    root.querySelector('[data-go-onboarding]')?.addEventListener('click', () => {
      navigate('/onboarding')
    })
    bindThemeToggle(root)
    bindLogout(navigate)
    return
  }

  if (sessionInfo?.user && !sessionInfo.user.onboardingDone) {
    navigate('/onboarding')
    return
  }