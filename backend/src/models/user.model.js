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