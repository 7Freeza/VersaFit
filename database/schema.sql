--VersaFit - PostgreSQL schema

--Drop tables in reverse dependency order
DROP TABLE IF EXISTS exercise_checkoffs CASCADE;
DROP TABLE IF EXISTS workout_sessions CASCADE;
DROP TABLE IF EXISTS weekly_schedule CASCADE;
DROP TABLE IF EXISTS routine_exercises CASCADE;
DROP TABLE IF EXISTS exercises CASCADE;
DROP TABLE IF EXISTS routines CASCADE;
DROP TABLE IF EXISTS training_plans CASCADE;
DROP TABLE IF EXISTS habit_logs CASCADE;
DROP TABLE IF EXISTS habits CASCADE;
DROP TABLE IF EXISTS weight_logs CASCADE;
DROP TABLE IF EXISTS physical_profiles CASCADE;
DROP TABLE IF EXISTS objectives CASCADE;
DROP TABLE IF EXISTS users CASCADE;

--Create tables

CREATE TABLE users(
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(255)UNIQUE NOT NULL,
    password_hash VARCHAR(255)NOT NULL,
    full_name VARCHAR(100)NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE objectives(
    objective_id SERIAL PRIMARY KEY,
    name VARCHAR(100)NOT NULL,
    description TEXT
);