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
    /* Pinta la rutina completa con sus ejercicios */
    root.innerHTML = `
      <div class="vf-page min-h-screen">
        ${topNav({ active: 'exercise', logoSize: 48 })}

        <main class="max-w-2xl mx-auto px-4 py-8">
          <button type="button" data-back class="vf-btn-ghost mb-6">← Volver</button>

          <section class="vf-card p-6 md:p-8 mb-8">
            <div class="flex items-start justify-between gap-3 mb-4">
              <div class="w-14 h-14 rounded-full bg-[var(--vf-accent)]/15 flex items-center justify-center text-3xl">
                ${categoryIcon(r.category)}
              </div>
              ${difficultyChip(r.difficulty)}
            </div>

            <h1 class="text-3xl font-black">${escapeHtml(r.name)}</h1>
            <p class="text-[var(--vf-muted)] mt-2">${escapeHtml(r.description || '')}</p>

            <div class="flex flex-wrap gap-5 mt-5 text-sm text-[var(--vf-muted)]">
              <div>
                <div class="font-bold text-[var(--vf-text)]">⏱ ${r.durationMin} min</div>
                <div>Duracion</div>
              </div>
              <div>
                <div class="font-bold text-[var(--vf-text)]">🔥 ${r.estimatedKcal} kcal</div>
                <div>Calorias</div>
              </div>
              <div>
                <div class="font-bold text-[var(--vf-text)]">⚡ ${exercises.length} ejerc.</div>
                <div>Ejercicios</div>
              </div>
            </div>

            <button type="button" class="vf-btn-primary mt-6" data-action="start" ${session?.isCompleted ? 'disabled' : ''}>
              ${
                session?.isCompleted
                  ? 'Rutina completada hoy'
                  : session
                    ? 'Sesion en curso'
                    : '▶ Iniciar rutina'
              }
            </button>
          </section>
          <section>
            <h2 class="font-bold text-xl mb-3">Ejercicios</h2>
            ${exercises
              .map((ex) => {
                const done = Boolean(checkMap[ex.exerciseId])
                return `
                  <label class="check-row ${done ? 'done' : ''}">
                    <input
                      type="checkbox"
                      data-exercise="${ex.exerciseId}"
                      ${done ? 'checked' : ''}
                      ${canCheck && !session?.isCompleted ? '' : 'disabled'}
                    />
                    <div>
                      <div class="font-semibold">${escapeHtml(ex.name)} ${ex.sets}×${ex.reps}</div>
                      <div class="text-xs text-[var(--vf-muted)]">
                        ${escapeHtml(ex.muscleGroup || '')}
                        ${ex.restSeconds ? ` · descanso ${ex.restSeconds}s` : ''}
                      </div>
                    </div>
                  </label>
                `
              })
              .join('')}

            ${
              !canCheck
                ? `<p class="text-sm text-[var(--vf-muted)] mt-2">Pulsa "Iniciar rutina" para poder marcar los ejercicios completados.</p>`
                : ''
            }
          </section>
        </main>
      </div>
    `
    /* Conecta los botones despues de pintar*/
    bindThemeToggle(root)
    bindLogout(navigate)

    root.querySelector('[data-back]')?.addEventListener('click', () => navigate('/dashboard'))

    root.querySelector('[data-action="start"]')?.addEventListener('click', async () => {
      if (session) return
      try {
        const data = await api.startRoutine(routineId)
        detail.session = data.session
        detail.checkoffs = data.checkoffs
        showToast('Rutina iniciada. ¡A entrenar!', 'success')
        await paint()
      } catch (error) {
        showToast(error.message, 'error')
      }
    })
/* Marca un ejercicio como completado */
    root.querySelectorAll('[data-exercise]').forEach((input) => {
      input.addEventListener('change', async () => {
        if (!detail.session) return
        const exerciseId = Number(input.getAttribute('data-exercise'))
        try {
          const result = await api.toggleExercise(
            detail.session.sessionId,
            exerciseId,
            input.checked
          )

          const item = detail.checkoffs.find((c) => c.exerciseId === exerciseId)
          if (item) item.isDone = input.checked

          if (result.sessionCompleted) {
            detail.session.isCompleted = true
            showToast('¡Rutina completada!', 'success')
          }

          await paint()
        } catch (error) {
          showToast(error.message, 'error')
          input.checked = !input.checked
        }
      })
    })
  }

  await paint()
}

