/* Pagina para los modulos que aun no estan listos — commit: feat: pagina de proximamente */
import { topNav, bindThemeToggle, bindLogout } from '../components/ui.js'

export function renderComingSoon(root, { navigate }) {
  root.innerHTML = `
    <div class="vf-page min-h-screen">
      ${topNav({ active: 'home', logoSize: 48 })}

      <main class="flex items-center justify-center px-4 py-20">
        <div class="vf-card p-8 md:p-12 max-w-lg w-full text-center">
          <div class="text-5xl mb-4">🚀</div>
          <p class="text-[var(--vf-accent)] text-xs font-bold tracking-[0.2em] mb-3">PROXIMAMENTE</p>
          <h1 class="text-3xl md:text-4xl font-black mb-3">Mas modulos en camino</h1>
          <p class="text-[var(--vf-muted)] mb-8 leading-relaxed">
            Estamos preparando nuevas experiencias para ti.
            Por ahora puedes usar el modulo de Ejercicio y seguir construyendo tus habitos.
          </p>
          <div class="flex flex-wrap gap-3 justify-center">
            <button type="button" data-go="home" class="vf-btn-ghost">← Volver al inicio</button>
            <button type="button" data-go="exercise" class="vf-btn-primary">Ir a Ejercicio →</button>
          </div>
        </div>
      </main>
    </div>
  `
/* Conecta los botones despues de pintar el html — commit: feat: pagina de proximamente */
  bindThemeToggle(root)
  bindLogout(navigate)

  root.querySelector('[data-go="home"]')?.addEventListener('click', () => navigate('/'))
  root.querySelector('[data-go="exercise"]')?.addEventListener('click', () => navigate('/dashboard'))
}
