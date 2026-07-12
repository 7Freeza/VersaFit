/** 
 * Database connection using node-postges
 * Reads credentials from enviroment variables
*/

import pg from'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pg

const pool = new Pool({
    host: process.env.DB_HOST || 'Localhost',
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'versafit',
})

pool.on('error', (error) => {
    console.error ('Unexpected database error:', error.message)
})

/**
 * Run a parameterized SQL query
 * @param {string} text - SQL text with $1, $2 placeholders
 * @param {array} params - Values for the placeholders
 */
export async function query(text, params = []){
    return pool.query(text, params)
}