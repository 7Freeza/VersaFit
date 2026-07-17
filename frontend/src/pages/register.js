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
  }
  /* Arma el formulario de registro */
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

          <form id="register-form" class="vf-card p-6 md:p-8">
            <h1 class="text-2xl font-bold text-center">Crea tu cuenta 🚀</h1>
            <p class="text-center text-[var(--vf-muted)] mt-1 mb-6 text-sm">
              Registrate gratis y empieza hoy mismo.
            </p>

            <label class="vf-label" for="fullName">Nombre</label>
            <input id="fullName" name="fullName" type="text" class="vf-input mb-1" placeholder="Tu nombre" />
            <p class="vf-error hidden" data-error="fullName"></p>

            <label class="vf-label mt-4" for="email">Correo electronico</label>
            <input id="email" name="email" type="email" class="vf-input mb-1" placeholder="tu@email.com" />
            <p class="vf-error hidden" data-error="email"></p>

            <label class="vf-label mt-4" for="password">Contrasena</label>
            <div class="relative">
              <input id="password" name="password" type="password" class="vf-input pr-12" placeholder="Minimo 6 caracteres" />
              <button type="button" data-toggle-pass class="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[var(--vf-muted)]">👁</button>
            </div>
            <p class="vf-error hidden" data-error="password"></p>
            <p class="vf-error hidden mt-3" data-error="form"></p>

            <button type="submit" class="vf-btn-primary w-full mt-6">
              Crear cuenta →
            </button>

            <p class="text-center text-sm mt-5 text-[var(--vf-muted)]">
              ¿Ya tienes cuenta?
              <a href="#/login" class="vf-link">Inicia sesion</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  `
  /* Conecta los eventos del formulario */
  bindThemeToggle(root)
  root.querySelector('[data-go="back"]')?.addEventListener('click', () => navigate('/'))

  root.querySelector('[data-toggle-pass]')?.addEventListener('click', () => {
    const input = root.querySelector('#password')
    input.type = input.type === 'password' ? 'text' : 'password'
  })

  const form = root.querySelector('#register-form')
  form.addEventListener('submit', async (event) => {
    event.preventDefault()

    const payload = {
      fullName: form.fullName.value,
      email: form.email.value,
      password: form.password.value,
    }
/* Valida y envia los datos al backend */
    const errors = validateRegisterForm(payload)
    ;['fullName', 'email', 'password', 'form'].forEach((key) => {
      const el = root.querySelector(`[data-error="${key}"]`)
      if (!el) return
      if (errors[key]) {
        el.textContent = errors[key]
        el.classList.remove('hidden')
      } else {
        el.textContent = ''
        el.classList.add('hidden')
      }
    })

    if (Object.keys(errors).length) return

    const button = form.querySelector('button[type="submit"]')
    button.disabled = true

    try {
      const data = await api.register(payload)
      saveSession(data.token, data.user)
      showToast('Cuenta creada', 'success')
      navigate('/onboarding')
    } catch (error) {
      const formError = root.querySelector('[data-error="form"]')
      formError.textContent = error.message || 'No se pudo crear la cuenta'
      formError.classList.remove('hidden')
    } finally {
      button.disabled = false
    }
  })
}
