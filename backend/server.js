/*
Versafit API entry point
Starts Express, mounts routes and global error handlers
 */

import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './src/routes/auth.routes.js'
import userRoutes from './src/routes/user.routes.js'
import exerciseRoutes from './src/routes/exercise.routes.js'
import { notFoundHandler, errorHandler } from './src/middleware/errorHandler.js'
import pool from './src/config/db.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

app.use(
    cors({
        origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    })
)
app.use(express.json())

app.get('/api/health', async (_req, res) => {
    try{
        await pool.query('SELECT 1')
        res.json({
            ok: true,
            message: 'Versafit API is running',
            database: 'connected'})
        }catch(error){
            res.status(503).json({
                ok: false,
                message: 'API is running but database is not available',
                database: 'disconnected'
            })
        }
    })

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/exercise', exerciseRoutes)