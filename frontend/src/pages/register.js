/* Pagina para crear una cuenta nueva */
import { api } from '../api.js'
import { saveSession, isLoggedIn } from '../auth.js'
import { showToast } from '../utils/toast.js'
import { validateRegisterForm } from '../utils/validate.js'
import { logoMarkup, bindThemeToggle, themeToggleButton } from '../components/ui.js'

export function renderRegister(root, { navigate }) {
  if (isLoggedIn()) {
    navigate('/dashboard')
    return
  }}