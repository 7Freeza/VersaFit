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