/* Onboarding por pasos: pide datos para generar el plan */
import { api } from '../api.js'
import { getCurrentUser, requireLogin } from '../auth.js'
import { setStoredUser } from '../utils/storage.js'
import { showToast } from '../utils/toast.js'
import { validateOnboardingStep } from '../utils/validate.js'
import { logoMarkup, bindThemeToggle, themeToggleButton, escapeHtml } from '../components/ui.js'

const ACTIVITY_OPTIONS = [
  { value: 'sedentary', label: 'Ninguna (Sedentario)' },
  { value: 'light', label: '1 a 2 dias' },
  { value: 'moderate', label: '3 a 5 dias' },
  { value: 'active', label: 'Mas de 5 dias' },
]

const PREFERENCE_OPTIONS = [
  { value: 'gym', label: 'Gimnasio / Pesas' },
  { value: 'running', label: 'Correr / Caminar / Ciclismo' },
  { value: 'yoga', label: 'Clases guiadas (Yoga, Pilates, Zumba)' },
  { value: 'team', label: 'Deportes de equipo (Futbol, Basquetbol, etc.)' },
]

const INTENSITY_OPTIONS = [
  { value: 'low', label: 'Baja - Empezar suave' },
  { value: 'medium', label: 'Media - Equilibrio y constancia' },
  { value: 'high', label: 'Alta - Quiero exigirme' },
]
/* Punto de entrada: valida sesion y arranca el estado del formulario */
export async function renderOnboarding(root, { navigate }) {
  if (!requireLogin(navigate)) return

  const user = getCurrentUser()
  if (user?.onboardingDone) {
    navigate('/dashboard')
    return
  }

  let step = 1
  let objectives = []
  let state = {
    fullName: user?.fullName || '',
    age: user?.age || '',
    heightCm: user?.heightCm || '',
    weightKg: user?.latestWeight || '',
    sex: user?.sex || 'Other',
    activityLevel: user?.activityLevel || '',
    objectiveId: user?.objectiveId || null,
    intensity: user?.intensity || '',
    preferences: user?.preferences ? String(user.preferences).split(',').filter(Boolean) : [],
  }
  /* Carga los objetivos disponibles desde el backend */
  try {
    const data = await api.objectives()
    objectives = data.objectives || []
  } catch {
    objectives = [
      { objectiveId: 1, name: 'Lose weight' },
      { objectiveId: 2, name: 'Build muscle' },
      { objectiveId: 3, name: 'Improve cardio' },
      { objectiveId: 4, name: 'Stay active' },
    ]
  }

  const objectiveLabels = {
    'Lose weight': 'Perder peso / Grasa corporal',
    'Build muscle': 'Ganar masa muscular / Fuerza',
    'Improve cardio': 'Mejorar salud y resistencia (Cardio)',
    'Stay active': 'Mantenerme activo / Desestresarme',
  }
/* Traduce los objetivos a etiquetas en español */
  function paint() {
    const progress = (step / 4) * 100
    const titles = ['DATOS BASICOS', 'TU NIVEL ACTUAL', 'TUS OBJETIVOS', 'PREFERENCIAS']

    root.innerHTML = `
      <div class="vf-page min-h-screen">
        <div class="px-4 md:px-8 py-4 flex items-center justify-between border-b border-[var(--vf-border)]">
          <div class="flex items-center">
            ${logoMarkup(44)}
          </div>
          <div class="flex items-center gap-3">
            ${themeToggleButton()}
            <span class="text-sm text-[var(--vf-muted)]">Paso ${step} de 4</span>
          </div>
        </div>

        <div class="max-w-xl mx-auto px-4 py-8">
          <div class="flex justify-between text-[10px] md:text-xs font-bold tracking-wide text-[var(--vf-muted)] mb-2">
            ${titles
              .map(
                (t, i) =>
                  `<span class="${i + 1 <= step ? 'text-[var(--vf-accent)]' : ''}">${t}</span>`
              )
              .join('')}
          </div>
          <div class="vf-progress-bar mb-8"><span style="width:${progress}%"></span></div>

          <div class="vf-card p-6 md:p-8">
            ${renderStep()}
            <p class="vf-error hidden mt-3" data-error="form"></p>
            <div class="mt-6 flex gap-3">
              ${
                step > 1
                  ? `<button type="button" data-action="back" class="vf-btn-ghost">← Atras</button>`
                  : ''
              }
              <button type="button" data-action="next" class="vf-btn-primary flex-1">
                ${step === 4 ? '¡Empezar a entrenar! →' : 'Continuar →'}
              </button>
            </div>
          </div>
        </div>
      </div>
    `
}}