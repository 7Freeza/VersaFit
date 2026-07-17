/* Detalle de una rutina con su checklist de ejercicios*/
import { api } from '../api.js'
import { requireLogin } from '../auth.js'
import { showToast } from '../utils/toast.js'
import {
  topNav,
  bindThemeToggle,
  bindLogout,
  difficultyChip,
  categoryIcon,
  escapeHtml,
} from '../components/ui.js'

export async function renderRoutine(root, { navigate, params }) {
  if (!requireLogin(navigate)) return

  const routineId = Number(params.routineId)
  if (!routineId) {
    navigate('/dashboard')
    return
  }
/* Punto de entrada: valida sesion y el id de la rutina */
  root.innerHTML = `
    <div class="vf-page min-h-screen">
      ${topNav({ active: 'exercise', logoSize: 48 })}
      <div class="max-w-2xl mx-auto px-4 py-10 text-[var(--vf-muted)]">Cargando rutina...</div>
    </div>
  `

  let detail = null

  try {
    detail = await api.routineDetail(routineId)
  } catch (error) {
    root.querySelector('.max-w-2xl').innerHTML = `
      <p class="text-[var(--vf-danger)]">${escapeHtml(error.message)}</p>
      <button class="vf-btn-primary mt-4" data-back>Volver al dashboard</button>
    `
    root.querySelector('[data-back]')?.addEventListener('click', () => navigate('/dashboard'))
    bindThemeToggle(root)
    bindLogout(navigate)
    return
  }

  async function paint() {
    const r = detail.routine
    const exercises = detail.exercises || []
    const session = detail.session
    const checkoffs = detail.checkoffs || []
    const checkMap = Object.fromEntries(checkoffs.map((c) => [c.exerciseId, c.isDone]))
    const canCheck = Boolean(session)
  }}