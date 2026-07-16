/* Pagina de inicio con acceso al modulo de ejercicio */
import {
  topNav,
  bindThemeToggle,
  bindLogout,
} from '../components/ui.js'
import { isLoggedIn } from '../auth.js'

export function renderLanding(root, { navigate }) {
  const logged = isLoggedIn()

  root.innerHTML = `
    <div class="vf-page">
      ${topNav({ active: 'home', logoSize: 52 })}

      <main class="px-4 md:px-10 py-10 md:py-14 max-w-6xl mx-auto">
        <section class="grid lg:grid-cols-2 gap-8 lg:gap-10 items-center">
          <div class="max-w-xl">
            <h1 class="text-4xl md:text-6xl font-black leading-tight">
              Disciplina hoy,<br />
              <span class="text-[var(--vf-accent)]">fuerza siempre.</span>
            </h1>
            <p class="mt-4 text-[var(--vf-muted)] text-lg">
              Entrena tu cuerpo, alimenta tu mente y construye la mejor version de ti.
            </p>

            <div class="mt-8 flex flex-wrap gap-3">
              <button type="button" data-go="start" class="vf-btn-primary">
                Comenzar ahora →
              </button>
              <a href="#modulos" class="vf-btn-ghost">▶ Ver como funciona</a>
            </div>
          </div>

          <div class="relative flex justify-center lg:justify-end">
            <img
              src="/assets/AguilaDashboard.png"
              alt="Mascota VersaFit"
              class="eagle-hero select-none pointer-events-none"
            />
          </div>
        </section>
        <section id="modulos" class="mt-16">
          <div class="flex items-center justify-between mb-5">
            <h2 class="text-xl font-bold">Modulos</h2>
            <button type="button" data-go="all-modules" class="text-sm text-[var(--vf-muted)] hover:text-[var(--vf-accent)] transition-colors">
              Ver todos →
            </button>
          </div>

          <div class="grid md:grid-cols-2 gap-4">
            <article class="module-card">
              <div class="w-12 h-12 rounded-full bg-[var(--vf-accent)]/20 flex items-center justify-center text-2xl mb-3">🏋️</div>
              <h3 class="text-xl font-bold">Ejercicio</h3>
              <p class="text-[var(--vf-muted)] mt-1 mb-3">Entrena, suda y superate cada dia.</p>
              <ul class="space-y-1 text-sm text-[var(--vf-muted)] mb-5">
                <li>✔ Rutinas para todos</li>
                <li>✔ Seguimiento de progreso</li>
              </ul>
              <button type="button" data-go="exercise" class="vf-btn-ghost">
                Explorar ejercicios →
              </button>
            </article>

            <article class="module-card module-card-soon">
              <div class="w-12 h-12 rounded-full bg-[var(--vf-accent)]/20 flex items-center justify-center text-2xl mb-3">🥗</div>
              <h3 class="text-xl font-bold">Nutricion</h3>
              <p class="text-[var(--vf-muted)] mt-1 mb-3">Alimentos reales, habitos poderosos.</p>
              <ul class="space-y-1 text-sm text-[var(--vf-muted)] mb-5">
                <li>✔ Planes personalizados</li>
                <li>✔ Seguimiento de comidas</li>
                <li>✔ Consejos y recetas</li>
              </ul>
              <button type="button" class="vf-btn-ghost opacity-60 cursor-not-allowed" disabled>
                Proximamente...
              </button>
            </article>
          </div>
        </section>
      </main>
    </div>
  `
}
