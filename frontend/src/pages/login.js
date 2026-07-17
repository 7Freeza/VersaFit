/* Pagina para iniciar sesion */
import { api } from '../api.js'
import { saveSession, isLoggedIn } from '../auth.js'
import { showToast } from '../utils/toast.js'
import { validateLoginForm } from '../utils/validate.js'
import { logoMarkup, bindThemeToggle, themeToggleButton } from '../components/ui.js'

export function renderLogin(root, { navigate }) {
  if (isLoggedIn()) {
    navigate('/dashboard')
    return
  }
/* Arma el formulario de login */
  root.innerHTML = `
    <div class="vf-page min-h-screen flex flex-col">
      <div class="px-4 md:px-8 py-4 flex items-center justify-between">
        <button type="button" data-go="back" class="vf-btn-ghost">← Volver</button>
        ${themeToggleButton()}
      </div>

      <div class="flex-1 flex items-center justify-center px-4 pb-10">
        <div class="w-full max-w-md">
          <div class="flex flex-col items-center mb-6">
            ${logoMarkup(56)}
          </div>

          <form id="login-form" class="vf-card p-6 md:p-8">
            <h1 class="text-2xl font-bold text-center">Bienvenido de vuelta 👋</h1>
            <p class="text-center text-[var(--vf-muted)] mt-1 mb-6 text-sm">
              Inicia sesion para acceder a tus rutinas.
            </p>

            <label class="vf-label" for="email">Correo electronico</label>
            <input id="email" name="email" type="email" class="vf-input mb-1" placeholder="tu@email.com" autocomplete="email" />
            <p class="vf-error hidden" data-error="email"></p>

            <label class="vf-label mt-4" for="password">Contrasena</label>
            <div class="relative">
              <input id="password" name="password" type="password" class="vf-input pr-12" placeholder="••••••••" autocomplete="current-password" />
              <button type="button" data-toggle-pass class="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[var(--vf-muted)]">👁</button>
            </div>
            <p class="vf-error hidden" data-error="password"></p>

            <p class="vf-error hidden mt-3" data-error="form"></p>

            <button type="submit" class="vf-btn-primary w-full mt-6">
              Iniciar sesion →
            </button>

            <p class="text-center text-sm mt-5 text-[var(--vf-muted)]">
              ¿No tienes cuenta?
              <a href="#/register" class="vf-link">Registrate gratis</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  `
}