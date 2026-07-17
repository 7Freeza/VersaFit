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
  }}