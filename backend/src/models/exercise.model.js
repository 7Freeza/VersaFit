/**
 * Exercise module data access: plans, routines, schedule, sessions.
 */

import { query, getClient } from '../config/db.js'

export async function getActivePlanForUser(userId) {
  const result = await query(
    `SELECT tp.plan_id, tp.duration_weeks, tp.is_active, tp.created_at,
            tp.objective_id, h.habit_id, h.name AS habit_name
     FROM training_plans tp
     JOIN habits h ON h.habit_id = tp.habit_id
     WHERE h.user_id = $1
       AND h.habit_type = 'exercise'
       AND tp.is_active = TRUE
     ORDER BY tp.created_at DESC
     LIMIT 1`,
    [userId]
  )
  return result.rows[0] || null
}

export async function getRoutinesByPlan(planId, category = null) {
  let sql = `
    SELECT routine_id, plan_id, name, description, category,
           difficulty, duration_min, estimated_kcal
    FROM routines
    WHERE plan_id = $1
  `
  const params = [planId]

  if (category && category !== 'all') {
    sql += ` AND category = $2`
    params.push(category)
  }

  sql += ` ORDER BY routine_id`
  const result = await query(sql, params)
  return result.rows
}

export async function getRoutineById(routineId, userId) {
  const result = await query(
    `SELECT r.routine_id, r.plan_id, r.name, r.description, r.category,
            r.difficulty, r.duration_min, r.estimated_kcal
     FROM routines r
     JOIN training_plans tp ON tp.plan_id = r.plan_id
     JOIN habits h ON h.habit_id = tp.habit_id
     WHERE r.routine_id = $1 AND h.user_id = $2`,
    [routineId, userId]
  )
  return result.rows[0] || null
}

export async function getRoutineExercises(routineId) {
  const result = await query(
    `SELECT e.exercise_id, e.name, e.muscle_group, e.description,
            re.sets, re.reps, re.rest_seconds, re.sort_order, re.day_name
     FROM routine_exercises re
     JOIN exercises e ON e.exercise_id = re.exercise_id
     WHERE re.routine_id = $1
     ORDER BY re.sort_order, e.name`,
    [routineId]
  )
  return result.rows
}

export async function getWeeklySchedule(userId) {
  const result = await query(
    `SELECT ws.schedule_id, ws.day_name, ws.is_rest_day,
            ws.routine_id, r.name AS routine_name, r.category
     FROM weekly_schedule ws
     LEFT JOIN routines r ON r.routine_id = ws.routine_id
     WHERE ws.user_id = $1
     ORDER BY
       CASE ws.day_name
         WHEN 'Monday' THEN 1
         WHEN 'Tuesday' THEN 2
         WHEN 'Wednesday' THEN 3
         WHEN 'Thursday' THEN 4
         WHEN 'Friday' THEN 5
         WHEN 'Saturday' THEN 6
         WHEN 'Sunday' THEN 7
       END`,
    [userId]
  )
  return result.rows
}

export async function upsertScheduleDay(userId, dayName, routineId, isRestDay) {
  const result = await query(
    `INSERT INTO weekly_schedule (user_id, day_name, routine_id, is_rest_day)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (user_id, day_name)
     DO UPDATE SET
       routine_id = EXCLUDED.routine_id,
       is_rest_day = EXCLUDED.is_rest_day
     RETURNING schedule_id, day_name, routine_id, is_rest_day`,
    [userId, dayName, isRestDay ? null : routineId, isRestDay]
  )
  return result.rows[0]
}

export async function ensureDefaultSchedule(userId) {
  const existing = await getWeeklySchedule(userId)
  if (existing.length > 0) {
    return existing
  }

  const days = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ]

  for (const day of days) {
    await query(
      `INSERT INTO weekly_schedule (user_id, day_name, is_rest_day)
       VALUES ($1, $2, TRUE)
       ON CONFLICT (user_id, day_name) DO NOTHING`,
      [userId, day]
    )
  }

  return getWeeklySchedule(userId)
}

/**
 * Colombia (America/Bogota) date helpers for weekly progress.
 */
function getBogotaDateParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'long',
  }).formatToParts(date)

  const map = {}
  for (const part of parts) {
    if (part.type !== 'literal') map[part.type] = part.value
  }

  return {
    isoDate: `${map.year}-${map.month}-${map.day}`,
    weekday: map.weekday,
  }
}

function getWeekDatesBogota() {
  const dayNames = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ]
  const weekdayToIndex = {
    Monday: 0,
    Tuesday: 1,
    Wednesday: 2,
    Thursday: 3,
    Friday: 4,
    Saturday: 5,
    Sunday: 6,
  }

  const today = getBogotaDateParts()
  const todayIndex = weekdayToIndex[today.weekday]
  const [year, month, day] = today.isoDate.split('-').map(Number)

  // Build dates relative to today in Bogota without UTC drift
  const week = {}
  for (let i = 0; i < 7; i += 1) {
    const offset = i - todayIndex
    const base = new Date(Date.UTC(year, month - 1, day))
    base.setUTCDate(base.getUTCDate() + offset)
    const y = base.getUTCFullYear()
    const m = String(base.getUTCMonth() + 1).padStart(2, '0')
    const d = String(base.getUTCDate()).padStart(2, '0')
    week[dayNames[i]] = `${y}-${m}-${d}`
  }

  return { week, todayIso: today.isoDate }
}

/**
 * Weekly plan status for each day (Colombia timezone).
 * complete: finished every exercise that day
 * incomplete: day already passed or session started without finishing
 * pending: today, not finished yet
 * upcoming: future day
 * rest: rest day
 */
export async function getWeeklyPlanStatus(userId) {
  const schedule = await getWeeklySchedule(userId)
  const { week, todayIso } = getWeekDatesBogota()
  const monday = week.Monday
  const sunday = week.Sunday

  const sessionsResult = await query(
    `SELECT session_id, routine_id,
            to_char(session_date, 'YYYY-MM-DD') AS session_date,
            is_completed
     FROM workout_sessions
     WHERE user_id = $1
       AND session_date >= $2::date
       AND session_date <= $3::date`,
    [userId, monday, sunday]
  )
  const sessions = sessionsResult.rows

  let completedThisWeek = 0

  const enriched = schedule.map((day) => {
    const date = week[day.day_name]
    let status = 'rest'

    if (!day.is_rest_day && day.routine_id) {
      const session = sessions.find(
        (s) =>
          String(s.session_date).slice(0, 10) === date &&
          Number(s.routine_id) === Number(day.routine_id)
      )

      if (session?.is_completed) {
        status = 'complete'
        completedThisWeek += 1
      } else if (session && !session.is_completed) {
        status = 'incomplete'
      } else if (date < todayIso) {
        status = 'incomplete'
      } else if (date === todayIso) {
        status = 'pending'
      } else {
        status = 'upcoming'
      }
    }

    return {
      ...day,
      date,
      status,
    }
  })

  return {
    schedule: enriched,
    completedThisWeek,
    totalDays: 7,
    today: todayIso,
  }
}

export async function getWeekCompletion(userId) {
  const status = await getWeeklyPlanStatus(userId)
  return status.completedThisWeek
}

export async function startSession(userId, routineId) {
  const client = await getClient()
  const { todayIso } = getWeekDatesBogota()

  try {
    await client.query('BEGIN')

    const sessionResult = await client.query(
      `INSERT INTO workout_sessions (user_id, routine_id, session_date, is_completed)
       VALUES ($1, $2, $3::date, FALSE)
       ON CONFLICT (user_id, routine_id, session_date)
       DO UPDATE SET started_at = NOW(), is_completed = FALSE, completed_at = NULL
       RETURNING session_id, user_id, routine_id, session_date, is_completed, started_at`,
      [userId, routineId, todayIso]
    )

    const session = sessionResult.rows[0]

    const exercises = await client.query(
      `SELECT exercise_id FROM routine_exercises WHERE routine_id = $1`,
      [routineId]
    )

    for (const row of exercises.rows) {
      await client.query(
        `INSERT INTO exercise_checkoffs (session_id, exercise_id, is_done)
         VALUES ($1, $2, FALSE)
         ON CONFLICT (session_id, exercise_id) DO NOTHING`,
        [session.session_id, row.exercise_id]
      )
    }

    await client.query('COMMIT')
    return session
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export async function getSessionForToday(userId, routineId) {
  const { todayIso } = getWeekDatesBogota()
  const result = await query(
    `SELECT session_id, user_id, routine_id, session_date, is_completed, started_at, completed_at
     FROM workout_sessions
     WHERE user_id = $1 AND routine_id = $2 AND session_date = $3::date`,
    [userId, routineId, todayIso]
  )
  return result.rows[0] || null
}

export async function getSessionCheckoffs(sessionId) {
  const result = await query(
    `SELECT ec.exercise_id, ec.is_done, e.name
     FROM exercise_checkoffs ec
     JOIN exercises e ON e.exercise_id = ec.exercise_id
     WHERE ec.session_id = $1
     ORDER BY e.name`,
    [sessionId]
  )
  return result.rows
}

export async function toggleCheckoff(sessionId, exerciseId, isDone) {
  const result = await query(
    `UPDATE exercise_checkoffs
     SET is_done = $3
     WHERE session_id = $1 AND exercise_id = $2
     RETURNING session_id, exercise_id, is_done`,
    [sessionId, exerciseId, isDone]
  )
  return result.rows[0] || null
}

export async function completeSession(sessionId, userId) {
  const result = await query(
    `UPDATE workout_sessions
     SET is_completed = TRUE, completed_at = NOW()
     WHERE session_id = $1 AND user_id = $2
     RETURNING session_id, is_completed, completed_at`,
    [sessionId, userId]
  )
  return result.rows[0] || null
}