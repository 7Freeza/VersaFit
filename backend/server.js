/**
 * ARCHIVO: backend/server.js
 * CAPA: Punto de entrada / servidor Express
 * CONECTA CON:
 *   - Importa: src/routes/*.routes.js (auth, users, progress, productivity, nutrition, exercise)
 *   - Lo ejecuta: npm start / node server.js (package.json)
 *   - Lo consume: frontend en CORS_ORIGIN (por defecto http://localhost:5173)
 * RESPONSABILIDAD: Inicializar Express, CORS, JSON, montar rutas /api/*, health check y manejadores 404/500.
 * ENDPOINTS / TABLAS / DATOS:
 *   - GET /api/health — verificación de estado
 *   - Prefijos: /api/auth, /api/users, /api/progress, /api/productivity, /api/nutrition, /api/exercise
 * NOTAS: Puerto en PORT (.env, default 3000). No contiene lógica de negocio; solo orquestación HTTP.
 */

import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './src/routes/auth.routes.js'
import usersRoutes from './src/routes/users.routes.js'
import progressRoutes from './src/routes/progress.routes.js'
import productivityRoutes from './src/routes/productivity.routes.js'
import nutritionRoutes from './src/routes/nutrition.routes.js'
import exerciseRoutes from './src/routes/exercise.routes.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }))
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, message: 'API funcionando' })
})

app.use('/api/auth', authRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/progress', progressRoutes)
app.use('/api/productivity', productivityRoutes)
app.use('/api/nutrition', nutritionRoutes)
app.use('/api/exercise', exerciseRoutes)

app.use((_req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' })
})

app.use((error, _req, res, _next) => {
  console.error(error)
  res.status(error.status || 500).json({ message: error.message || 'Error interno del servidor' })
})

app.listen(PORT, () => {
  console.log(`Backend escuchando en http://localhost:${PORT}`)
})