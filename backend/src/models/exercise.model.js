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