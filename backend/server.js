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