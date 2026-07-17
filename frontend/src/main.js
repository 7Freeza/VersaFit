/**
 * Application bootstrap: theme, routes and SPA start.
 */

import './style.css'
import { initTheme } from './utils/theme.js'
import { addRoute, startRouter } from './router.js'
import { renderLanding } from './pages/landing.js'
import { renderLogin } from './pages/login.js'
import { renderRegister } from './pages/register.js'
import { renderOnboarding } from './pages/onboarding.js'
import { renderDashboard } from './pages/dashboard.js'
import { renderRoutine } from './pages/routine.js'
import { renderComingSoon } from './pages/comingSoon.js'

initTheme()

addRoute('/', renderLanding)
addRoute('/login', renderLogin)
addRoute('/register', renderRegister)
addRoute('/onboarding', renderOnboarding)
addRoute('/dashboard', renderDashboard)
addRoute('/routine/:routineId', renderRoutine)
addRoute('/coming-soon', renderComingSoon)

const app = document.getElementById('app')
startRouter(app)
