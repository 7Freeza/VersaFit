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
