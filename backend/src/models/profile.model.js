/**
 * Physical profile and weight log data access.
 */

import { query, getClient } from '../config/db.js'

export async function getObjectives() {
  const result = await query(
    `SELECT objective_id, name, description
     FROM objectives
     ORDER BY objective_id`
  )
  return result.rows
}

export async function upsertProfile(userId, data) {
  const client = await getClient()

  try {
    await client.query('BEGIN')

    const existing = await client.query(
      `SELECT profile_id FROM physical_profiles WHERE user_id = $1`,
      [userId]
    )

    let profileId

    if (existing.rows[0]) {
      const updated = await client.query(
        `UPDATE physical_profiles SET
           objective_id = COALESCE($2, objective_id),
           age = COALESCE($3, age),
           height_cm = COALESCE($4, height_cm),
           sex = COALESCE($5, sex),
           activity_level = COALESCE($6, activity_level),
           intensity = COALESCE($7, intensity),
           preferences = COALESCE($8, preferences),
           onboarding_done = COALESCE($9, onboarding_done),
           updated_at = NOW()
         WHERE user_id = $1
         RETURNING profile_id`,
        [
          userId,
          data.objectiveId ?? null,
          data.age ?? null,
          data.heightCm ?? null,
          data.sex ?? null,
          data.activityLevel ?? null,
          data.intensity ?? null,
          data.preferences ?? null,
          data.onboardingDone ?? null,
        ]
      )
      profileId = updated.rows[0].profile_id
    } else {
      const created = await client.query(
        `INSERT INTO physical_profiles (
           user_id, objective_id, age, height_cm, sex,
           activity_level, intensity, preferences, onboarding_done
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING profile_id`,
        [
          userId,
          data.objectiveId ?? null,
          data.age ?? null,
          data.heightCm ?? null,
          data.sex ?? null,
          data.activityLevel ?? null,
          data.intensity ?? null,
          data.preferences ?? null,
          data.onboardingDone ?? false,
        ]
      )
      profileId = created.rows[0].profile_id
    }

    if (data.weightKg != null) {
      await client.query(
        `INSERT INTO weight_logs (profile_id, weight_kg)
         VALUES ($1, $2)`,
        [profileId, data.weightKg]
      )
    }

    if (data.fullName) {
      await client.query(
        `UPDATE users SET full_name = $2 WHERE user_id = $1`,
        [userId, data.fullName.trim()]
      )
    }

    await client.query('COMMIT')
    return profileId
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export async function addWeightLog(userId, weightKg) {
  const profile = await query(
    `SELECT profile_id FROM physical_profiles WHERE user_id = $1`,
    [userId]
  )

  if (!profile.rows[0]) {
    const error = new Error('Physical profile not found. Complete onboarding first.')
    error.status = 400
    throw error
  }

  const result = await query(
    `INSERT INTO weight_logs (profile_id, weight_kg)
     VALUES ($1, $2)
     RETURNING log_id, weight_kg, recorded_at`,
    [profile.rows[0].profile_id, weightKg]
  )

  return result.rows[0]
}

export async function getWeightHistory(userId, limit = 12) {
  const result = await query(
    `SELECT w.log_id, w.weight_kg, w.recorded_at
     FROM weight_logs w
     JOIN physical_profiles p ON p.profile_id = w.profile_id
     WHERE p.user_id = $1
     ORDER BY w.recorded_at DESC
     LIMIT $2`,
    [userId, limit]
  )
  return result.rows
}

/**
 * Returns true if the user should be prompted for weekly weight.
 * Rule: no weight log in the last 7 days.
 */
export async function needsWeeklyWeight(userId) {
  const result = await query(
    `SELECT w.recorded_at
     FROM weight_logs w
     JOIN physical_profiles p ON p.profile_id = w.profile_id
     WHERE p.user_id = $1
     ORDER BY w.recorded_at DESC
     LIMIT 1`,
    [userId]
  )

  if (!result.rows[0]) {
    return true
  }

  const last = new Date(result.rows[0].recorded_at)
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000
  return Date.now() - last.getTime() > sevenDaysMs
}