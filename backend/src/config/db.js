/**
 * Database connection pool using node-postgres (pg).
 * Reads credentials from environment variables.
 */

import pg from 'pg'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../../.env') })

const { Pool } = pg

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'versafit',
})

pool.on('error', (error) => {
  console.error('Unexpected database error:', error.message)
})

/**
 * Run a parameterized SQL query.
 * @param {string} text - SQL text with $1, $2 placeholders
 * @param {Array} params - Values for the placeholders
 */
export async function query(text, params = []) {
  return pool.query(text, params)
}

/**
 * Get a client from the pool for transactions.
 */
export async function getClient() {
  return pool.connect()
}

export default pool
