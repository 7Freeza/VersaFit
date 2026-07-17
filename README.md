# VersaFit

Web app for habit improvement. Current MVP focuses on the **exercise module**: personalized routines, weekly plan, exercise checklists and weekly weight tracking.

## Stack

| Layer | Technology |
|-------|------------|
| Database | PostgreSQL (3NF) |
| Backend | Node.js + Express.js |
| Frontend | HTML, CSS, JavaScript (SPA) + Vite + Tailwind CSS |
| Security | bcryptjs password hashing + JWT sessions |
| Third-party APIs | wger.de (exercises) and quotable.io (motivation quotes) |

## Features

- Landing page with module access
- Login / register with session persistence (`localStorage` + JWT)
- Multi-step onboarding (age, weight, height, goal, intensity, preferences)
- AI-style personalized plan generator (business rules + free exercise API)
- Dashboard: weekly plan, routine cards, filters
- Routine detail with start button and exercise checklist
- Weekly weight prompt and weight history
- Dark / light mode
- SPA navigation (single HTML, hash routes)

## Quick start

Full steps for Linux and Windows are in **[INSTALLATION.md](./INSTALLATION.md)**.

```bash
# 1) Create DB and load SQL
psql -U postgres -d versafit -f database/schema.sql
psql -U postgres -d versafit -f database/seed.sql

# 2) Configure backend env
cp backend/.env.example backend/.env
# edit DB credentials

# 3) Install packages (you run this)
npm run install:all

# 4) Start app
npm run dev
```

- Frontend: http://localhost:5173  
- Backend: http://localhost:3000/api/health  

## Folder structure

```text
VersaFit/
├── database/
│   ├── schema.sql      # tables, relations, 3NF
│   ├── seed.sql        # demo data
│   └── queries.sql     # example functional queries
├── backend/
│   ├── server.js
│   ├── .env.example
│   └── src/
│       ├── config/     # database pool
│       ├── middleware/ # auth, errors
│       ├── models/     # SQL access
│       ├── controllers/
│       ├── routes/
│       ├── services/   # plan generator + third-party APIs
│       └── utils/      # validators
└── frontend/
    ├── index.html
    ├── public/assets/  # logos and backgrounds
    └── src/
        ├── main.js
        ├── router.js
        ├── api.js
        ├── pages/      # landing, login, register, onboarding, dashboard, routine
        ├── components/
        └── utils/
```

## Main API routes

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Current user + weekly weight flag |
| PUT | `/api/users/profile` | Update profile |
| POST | `/api/users/onboarding` | Finish onboarding + generate plan |
| POST | `/api/users/weight` | Log weight |
| GET | `/api/users/weight` | Weight history |
| GET | `/api/exercise/dashboard` | Plan, schedule, routines |
| GET | `/api/exercise/routines/:id` | Routine detail |
| PUT | `/api/exercise/schedule` | Assign routine to weekday |
| POST | `/api/exercise/routines/:id/start` | Start session |
| PATCH | `/api/exercise/sessions/:id/exercises/:exerciseId` | Checklist toggle |
| POST | `/api/exercise/generate-plan` | Regenerate plan |
| GET | `/api/exercise/motivation` | Quote from third-party API |

## Database notes

The schema follows the logic of `DB-Versafit.sql`:

- `users` → auth
- `physical_profiles` → age, height, intensity, goal
- `weight_logs` → historical weight (weekly tracking)
- `habits` / `habit_logs` → generic habit core
- `training_plans` → plan linked to exercise habit
- `routines` / `exercises` / `routine_exercises` → workouts
- `weekly_schedule` → which day runs which routine
- `workout_sessions` / `exercise_checkoffs` → checklist progress

## Authors

- Juan Varela
- Juan Rangel
- Jonathan Escorcia
- Sebastián Ropain
- Isaac Ordoñez
