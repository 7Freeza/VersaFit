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
/* Carga los datos del dashboard y la frase motivacional — commit: feat: dashboard de ejercicio */
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
  /* Pinta el dashboard completo con el plan y las rutinas — commit: feat: dashboard de ejercicio */
  async function paint() {
    const schedule = dashboard.schedule || []
    const routines = (dashboard.routines || []).filter((r) => r.category !== 'flexibility')
    const completed = dashboard.completedThisWeek || 0
    const totalDays = dashboard.totalDays || 7
    const user = getCurrentUser()
    const latestWeight = user?.latestWeight

    root.innerHTML = `
      <div class="vf-page min-h-screen">
        ${topNav({ active: 'exercise', logoSize: 48 })}

        <main class="max-w-6xl mx-auto px-4 md:px-8 py-8">
          <div class="flex flex-wrap items-center gap-3 mb-6">
            <button type="button" data-go="home" class="vf-btn-ghost">← Volver</button>
            <span class="font-bold text-[var(--vf-muted)]">Modulo · Ejercicio</span>
          </div>

          <p class="text-[var(--vf-accent)] text-xs font-bold tracking-[0.2em] mb-2">MODULO</p>
          <h1 class="text-3xl md:text-5xl font-black leading-tight">
            Entrena, suda y<br />
            <span class="text-[var(--vf-accent)]">superate cada dia.</span>
          </h1>
          <p class="text-[var(--vf-muted)] mt-3 mb-8 max-w-2xl">
            Rutinas disenadas para todos los niveles. Elige la tuya y empieza.
          </p>
          ${
            sessionInfo?.needsWeeklyWeight
              ? `
            <section class="vf-card p-5 mb-6 border-[var(--vf-accent)]">
              <h3 class="font-bold text-lg">Seguimiento semanal de peso</h3>
              <p class="text-sm text-[var(--vf-muted)] mb-3">Han pasado 7 dias o mas. Registra tu peso actual.</p>
              <form id="weight-form" class="flex flex-wrap gap-3 items-end">
                <div>
                  <label class="vf-label" for="weightKg">Peso (kg)</label>
                  <input id="weightKg" name="weightKg" type="number" step="0.1" min="1" class="vf-input w-40" placeholder="Ej: 72.5" />
                </div>
                <button type="submit" class="vf-btn-primary">Guardar peso</button>
              </form>
              <p class="vf-error hidden" data-error="weight"></p>
            </section>
          `
              : ''
          }
          <section class="vf-card p-5 mb-8">
            <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h2 class="font-bold text-lg">Plan semanal</h2>
              <span class="text-[var(--vf-accent)] font-semibold text-sm">${completed} / ${totalDays} completados</span>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2" id="schedule-grid">
              ${schedule
                .map((day) => {
                  const status = day.status || (day.isRestDay ? 'rest' : 'pending')
                  const statusText = statusLabelEs(status)
                  const sub = day.isRestDay
                    ? 'Descanso'
                    : categoryLabelEs(day.category) || day.routineName || 'Rutina'
                  const mark =
                    status === 'complete'
                      ? '✓'
                      : status === 'incomplete'
                        ? '!'
                        : status === 'rest'
                          ? '○'
                          : '·'
                  return `
                    <button type="button" class="day-pill status-${status}" data-day="${day.dayName}">
                      <div class="label">${dayLabelEs(day.dayName)}</div>
                      <div class="text-lg leading-none mt-1">${mark}</div>
                      <div class="sub">${escapeHtml(sub)}</div>
                      <div class="status-text">${escapeHtml(statusText)}</div>
                    </button>
                  `
                })
                .join('')}
            </div>
            <p class="text-xs text-[var(--vf-muted)] mt-3">
              Completo = todos los ejercicios del dia terminados. Incompleto = dia pasado o rutina sin terminar.
              Toca un dia para asignar una rutina o marcarlo como descanso.
            </p>
          </section>
          <section class="mb-6">
            <div class="flex flex-wrap gap-2" id="filters">
              ${['all', 'strength', 'cardio', 'hiit']
                .map((cat) => {
                  const labels = {
                    all: 'Todos',
                    strength: 'Fuerza',
                    cardio: 'Cardio',
                    hiit: 'HIIT',
                  }
                  return `
                    <button type="button" class="filter-pill ${category === cat ? 'active' : ''}" data-filter="${cat}">
                      ${labels[cat]}
                    </button>
                  `
                })
                .join('')}
            </div>
          </section>

          <section class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
            ${
              routines.length
                ? routines
                    .map(
                      (r) => `
                  <article class="vf-card p-5 flex flex-col">
                    <div class="flex items-start justify-between gap-3 mb-3">
                      <div class="w-12 h-12 rounded-full bg-[var(--vf-accent)]/15 flex items-center justify-center text-2xl">
                        ${categoryIcon(r.category)}
                      </div>
                      ${difficultyChip(r.difficulty)}
                    </div>
                    <h3 class="text-lg font-bold">${escapeHtml(r.name)}</h3>
                    <p class="text-sm text-[var(--vf-muted)] mt-1 flex-1">${escapeHtml(r.description || '')}</p>
                    <div class="flex gap-4 text-sm text-[var(--vf-muted)] mt-4 mb-4">
                      <span>⏱ ${r.durationMin} min</span>
                      <span>🔥 ${r.estimatedKcal} kcal</span>
                    </div>
                    <button type="button" class="vf-btn-ghost w-full" data-open-routine="${r.routineId}">
                      ▶ Ver rutina
                    </button>
                  </article>
                `
/* Cierra la lista de tarjetas de rutinas */
                    )
                    .join('')
                : `<div class="vf-card p-6 sm:col-span-2 lg:col-span-3">
                    <p class="mb-3">Aun no tienes rutinas. Genera un plan personalizado.</p>
                    <button type="button" class="vf-btn-primary" data-action="generate">Generar plan</button>
                  </div>`
            }
          </section>

          <section class="vf-card p-5 mb-8">
            <h3 class="font-bold mb-2">Motivacion del dia</h3>
            <p class="text-lg">"${escapeHtml(motivation?.quote || '')}"</p>
            <p class="text-sm text-[var(--vf-muted)] mt-2">— ${escapeHtml(motivation?.author || 'VersaFit')}</p>
          </section>

          <div class="flex flex-wrap gap-3 pb-10">
            <button type="button" class="vf-btn-ghost" data-action="generate">Regenerar plan</button>
            <button type="button" class="vf-btn-ghost" data-action="history">
              Ver historial de peso${latestWeight != null ? ` (${latestWeight} kg)` : ''}
            </button>
          </div>
        </main>
      </div>
    `
    /* Conecta los botones despues de pintar el html — commit: feat: dashboard de ejercicio */
    bindThemeToggle(root)
    bindLogout(navigate)

    root.querySelector('[data-go="home"]')?.addEventListener('click', () => navigate('/'))

    root.querySelectorAll('[data-filter]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        category = btn.getAttribute('data-filter')
        dashboard = await api.exerciseDashboard(category)
        await paint()
      })
    })

    root.querySelectorAll('[data-open-routine]').forEach((btn) => {
      btn.addEventListener('click', () => {
        navigate(`/routine/${btn.getAttribute('data-open-routine')}`)
      })
    })
/* Abre el editor para asignar rutina a un dia*/
    root.querySelectorAll('[data-day]').forEach((btn) => {
      btn.addEventListener('click', () => openScheduleEditor(btn.getAttribute('data-day')))
    })

    root.querySelectorAll('[data-action="generate"]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        btn.disabled = true
        try {
          await api.regeneratePlan()
          showToast('Nuevo plan generado', 'success')
          dashboard = await api.exerciseDashboard(category)
          await paint()
        } catch (error) {
          showToast(error.message || 'No se pudo generar el plan', 'error')
        } finally {
          btn.disabled = false
        }
      })
    })
    /* Abre el historial de peso */
    root.querySelector('[data-action="history"]')?.addEventListener('click', () => {
      openWeightHistory()
    })

    const weightForm = root.querySelector('#weight-form')
    weightForm?.addEventListener('submit', async (event) => {
      event.preventDefault()
      const value = weightForm.weightKg.value
      const errorMsg = validateWeight(value)
      const errorEl = root.querySelector('[data-error="weight"]')

      if (errorMsg) {
        errorEl.textContent = errorMsg
        errorEl.classList.remove('hidden')
        return
      }

      try {
        await api.addWeight(Number(value))
        showToast('Peso guardado', 'success')
        sessionInfo = await refreshSession()
        await paint()
      } catch (error) {
        errorEl.textContent = error.message
        errorEl.classList.remove('hidden')
      }
    })
  }
/* Muestra el modal con el historial de peso */
  async function openWeightHistory() {
    const modalRoot = document.getElementById('modal-root')
    modalRoot.classList.remove('hidden')
    modalRoot.innerHTML = `
      <div class="modal-backdrop">
        <div class="vf-card p-6 w-full max-w-md">
          <p class="text-[var(--vf-muted)] text-sm">Cargando historial...</p>
        </div>
      </div>
    `

    try {
      const data = await api.weightHistory()
      const history = data.history || []
      const user = getCurrentUser()
      const latest = user?.latestWeight

      modalRoot.innerHTML = `
        <div class="modal-backdrop">
          <div class="vf-card p-6 w-full max-w-md">
            <div class="flex items-start justify-between gap-3 mb-4">
              <div>
                <h3 class="text-xl font-bold">Historial de peso</h3>
                <p class="text-sm text-[var(--vf-muted)] mt-1">
                  Peso actual:
                  <span class="text-[var(--vf-accent)] font-bold">
                    ${latest != null ? `${latest} kg` : 'Sin registro'}
                  </span>
                </p>
              </div>
              <button type="button" class="vf-btn-ghost text-sm py-1 px-3" data-close>Cerrar</button>
            </div>

            <div class="weight-history-list mb-5">
              ${
                history.length
                  ? history
                      .map(
                        (h) => `
                    <div class="weight-history-row">
                      <span>${new Date(h.recordedAt).toLocaleDateString('es-CO', {
                        timeZone: 'America/Bogota',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}</span>
                      <strong>${h.weightKg} kg</strong>
                    </div>
                  `
                      )
                      .join('')
                  : `<p class="text-sm text-[var(--vf-muted)]">Aun no hay registros de peso.</p>`
              }
            </div>

            <form id="history-weight-form">
              <label class="vf-label" for="newWeightKg">Nuevo peso corporal (kg)</label>
              <div class="flex gap-2">
                <input
                  id="newWeightKg"
                  name="newWeightKg"
                  type="number"
                  step="0.1"
                  min="1"
                  class="vf-input flex-1"
                  placeholder="Ej: 72.5"
                />
                <button type="submit" class="vf-btn-primary whitespace-nowrap">Actualizar</button>
              </div>
              <p class="vf-error hidden" data-error="history-weight"></p>
            </form>
          </div>
        </div>
      `
    /* Conecta los eventos del modal de historial */
      modalRoot.querySelector('[data-close]')?.addEventListener('click', closeModal)
      modalRoot.querySelector('.modal-backdrop')?.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-backdrop')) closeModal()
      })

      modalRoot.querySelector('#history-weight-form')?.addEventListener('submit', async (event) => {
        event.preventDefault()
        const form = event.currentTarget
        const value = form.newWeightKg.value
        const errorEl = modalRoot.querySelector('[data-error="history-weight"]')
        const errorMsg = validateWeight(value)

        if (errorMsg) {
          errorEl.textContent = errorMsg
          errorEl.classList.remove('hidden')
          return
        }

        try {
          await api.addWeight(Number(value))
          showToast('Peso actualizado', 'success')
          sessionInfo = await refreshSession()
          closeModal()
          await paint()
        } catch (error) {
          errorEl.textContent = error.message
          errorEl.classList.remove('hidden')
        }
      })
    } catch (error) {
      showToast(error.message, 'error')
      closeModal()
    }
  }
/* Abre el modal para editar el plan de un dia */
  function openScheduleEditor(dayName) {
    const modalRoot = document.getElementById('modal-root')
    const routines = (dashboard.routines || []).filter((r) => r.category !== 'flexibility')
    const current = (dashboard.schedule || []).find((d) => d.dayName === dayName)

    modalRoot.classList.remove('hidden')
    modalRoot.innerHTML = `
      <div class="modal-backdrop">
        <div class="vf-card p-6 w-full max-w-md">
          <h3 class="text-xl font-bold mb-2">Plan para ${dayLabelEs(dayName)}</h3>
          <p class="text-sm text-[var(--vf-muted)] mb-4">Elige una rutina o marca descanso.</p>

          <button type="button" class="vf-option ${current?.isRestDay ? 'selected' : ''}" data-pick="rest">
            Descanso
          </button>
          ${routines
            .map(
              (r) => `
            <button type="button" class="vf-option ${Number(current?.routineId) === Number(r.routineId) ? 'selected' : ''}" data-pick="${r.routineId}">
              ${escapeHtml(r.name)} · ${categoryLabelEs(r.category)}
            </button>
          `
            )
            .join('')}

          <button type="button" class="vf-btn-ghost w-full mt-3" data-close>Cerrar</button>
        </div>
      </div>
    `