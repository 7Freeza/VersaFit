# VersaFit - Installation Guide

This guide explains how to install and run VersaFit on **Linux** and **Windows**.

## What you need first

Install these tools before starting:

| Tool | Version suggested | Why |
|------|-------------------|-----|
| Node.js | 20 LTS or newer | Runs backend and frontend |
| npm | Comes with Node.js | Installs project packages |
| PostgreSQL | 14 or newer | Database |
| Git | Any recent version | Optional, for cloning |

### Download links

- Node.js: https://nodejs.org/
- PostgreSQL: https://www.postgresql.org/download/

---

## 1. Project folder

Open a terminal in the project root:

```bash
cd /home/tatan/VersaFit
```

On Windows (PowerShell or CMD), use your real path, for example:

```powershell
cd C:\Users\YourUser\VersaFit
```

---

## 2. Create the PostgreSQL database

### Linux

```bash
# Open PostgreSQL shell (user may vary)
sudo -u postgres psql
```

Inside `psql`:

```sql
CREATE DATABASE versafit;
CREATE USER versafit_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE versafit TO versafit_user;
\q
```

On PostgreSQL 15+, you may also need:

```bash
sudo -u postgres psql -d versafit -c "GRANT ALL ON SCHEMA public TO versafit_user;"
```

Load schema and seed:

```bash
# From the project root
psql -U postgres -d versafit -f database/schema.sql
psql -U postgres -d versafit -f database/seed.sql
```

If you created `versafit_user`:

```bash
psql -U versafit_user -d versafit -h localhost -f database/schema.sql
psql -U versafit_user -d versafit -h localhost -f database/seed.sql
```

### Windows

1. Open **SQL Shell (psql)** or pgAdmin.
2. Create database `versafit`.
3. From PowerShell (adjust path and password):

```powershell
cd C:\Users\YourUser\VersaFit
psql -U postgres -d versafit -f database\schema.sql
psql -U postgres -d versafit -f database\seed.sql
```

Optional useful queries for class review:

```bash
psql -U postgres -d versafit -f database/queries.sql
```

---

## 3. Backend environment file

Copy the example env file:

### Linux

```bash
cp backend/.env.example backend/.env
```

### Windows (PowerShell)

```powershell
copy backend\.env.example backend\.env
```

Edit `backend/.env` and set your values:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=versafit
JWT_SECRET=change_this_secret_in_production
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

---

## 4. Install dependencies

**You must install the packages yourself.** From the project root:

### Linux / Windows (same npm commands)

```bash
npm install
npm install -w backend
npm install -w frontend
```

Or use the helper script:

```bash
npm run install:all
```

### Dependencies that will be installed

**Root**

- `concurrently` (run frontend and backend together)

**Backend** (`backend/package.json`)

- `express` - HTTP server and routes
- `pg` - PostgreSQL client
- `bcryptjs` - password hashing
- `jsonwebtoken` - session tokens
- `cors` - allow frontend requests
- `dotenv` - load `.env` variables

**Frontend** (`frontend/package.json`)

- `vite` - frontend dev server and build
- `tailwindcss` - utility CSS
- `@tailwindcss/vite` - Tailwind plugin for Vite

If something is missing later, install it with:

```bash
npm install <package-name> -w backend
# or
npm install <package-name> -w frontend
```

---

## 5. Run the application

### Option A: both servers with one command

From project root:

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- Health check: http://localhost:3000/api/health

### Option B: separate terminals

Terminal 1 (backend):

```bash
npm run dev:backend
```

Terminal 2 (frontend):

```bash
npm run dev:frontend
```

---

## 6. Demo account (from seed.sql)

After loading `database/seed.sql`:

- Email: `demo@versafit.com`
- Password: `password`

You can also register a new account from the UI (recommended for testing the full onboarding flow).

---

## 7. Typical workflow

1. Open http://localhost:5173
2. Create account or log in
3. Complete onboarding (age, weight, height, goal, intensity)
4. App generates a personalized exercise plan
5. Use the weekly plan and open routine cards
6. Start a routine and check off exercises
7. Once a week, enter your weight when the app asks for it

---

## 8. Common problems

### Database connection error

- Check PostgreSQL is running
- Check `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` in `backend/.env`
- Confirm database exists: `\l` inside `psql`

### Port already in use

- Backend port 3000 busy: change `PORT` in `.env`
- Frontend port 5173 busy: Vite will offer another port, or stop the other process

### CORS errors

- Keep frontend on `http://localhost:5173`
- Keep `CORS_ORIGIN=http://localhost:5173` in backend `.env`

### npm install fails on Windows

- Run the terminal as a normal user (not blocked by antivirus)
- Make sure Node.js was installed with npm selected
- Delete `node_modules` and `package-lock.json`, then run `npm install` again only if needed

### Linux: psql command not found

```bash
# Debian/Ubuntu
sudo apt update
sudo apt install postgresql postgresql-contrib

# Fedora
sudo dnf install postgresql postgresql-server
```

---

## 9. Project structure (quick map)

```text
VersaFit/
  database/          # schema.sql, seed.sql, queries.sql
  backend/           # Express API (Node.js)
  frontend/          # Vite SPA (HTML, CSS, JS, Tailwind)
  INSTALLATION.md    # this file
  README.md          # project overview
```

---

## 10. Production build (optional)

```bash
npm run build
```

Built files go to `frontend/dist/`. The backend can still run with:

```bash
npm run dev:backend
# or inside backend:
npm start
```

For a full production deploy you would serve `frontend/dist` with Nginx or similar and keep the API on Node.
