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