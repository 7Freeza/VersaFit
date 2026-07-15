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