import { query } from '../config/db.js'

export async function findUserByEmail(email) {
  const result = await query(
    `SELECT user_id, email, password_hash, full_name, is_active, created_at
     FROM users
     WHERE email = $1`,
    [email.toLowerCase().trim()]
  )
  return result.rows[0] || null
}

export async function findUserById(userId) {
  const result = await query(
    `SELECT user_id, email, full_name, is_active, created_at
     FROM users
     WHERE user_id = $1`,
    [userId]
  )
  return result.rows[0] || null
}

export async function createUser({ fullName, email, passwordHash }) {
  const result = await query(
    `INSERT INTO users (full_name, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING user_id, email, full_name, created_at`,
    [fullName.trim(), email.toLowerCase().trim(), passwordHash]
  )
  return result.rows[0]
}

export async function getUserWithProfile(userId) {
  const result = await query(
    `SELECT
       u.user_id,
       u.email,
       u.full_name,
       u.created_at,
       p.profile_id,
       p.age,
       p.height_cm,
       p.sex,
       p.activity_level,
       p.intensity,
       p.preferences,
       p.onboarding_done,
       p.objective_id,
       o.name AS objective_name,
       (
         SELECT w.weight_kg
         FROM weight_logs w
         WHERE w.profile_id = p.profile_id
         ORDER BY w.recorded_at DESC
         LIMIT 1
       ) AS latest_weight,
       (
         SELECT w.recorded_at
         FROM weight_logs w
         WHERE w.profile_id = p.profile_id
         ORDER BY w.recorded_at DESC
         LIMIT 1
       ) AS latest_weight_at
     FROM users u
     LEFT JOIN physical_profiles p ON p.user_id = u.user_id
     LEFT JOIN objectives o ON o.objective_id = p.objective_id
     WHERE u.user_id = $1`,
    [userId]
  )
  return result.rows[0] || null
}
