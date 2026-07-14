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

--USERS

CREATE TABLE users(
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(255)UNIQUE NOT NULL,
    password_hash VARCHAR(255)NOT NULL,
    full_name VARCHAR(100)NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

--OBJECTIVES

CREATE TABLE objectives(
    objective_id SERIAL PRIMARY KEY,
    name VARCHAR(100)NOT NULL,
    description TEXT
);

--PHYSICAL PROFILES

CREATE TABLE physical_profiles (
    profile_id SERIAL PRIMARY KEY,
    user_id INT UNIQUE NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    objective_id INT REFERENCES objectives(objective_id),
    age INT CHECK (age IS NULL OR (age >= 12 AND age <= 100)),
    height_cm NUMERIC(5,2) CHECK (height_cm IS NULL OR (height_cm >= 100 AND height_cm <= 250)),
    sex VARCHAR(10) CHECK (sex IS NULL OR sex IN ('M', 'F', 'Other')),
    activity_level VARCHAR(30) CHECK (
        activity_level IS NULL OR activity_level IN (
            'sedentary', 'light', 'moderate', 'active'
        )
    ),
    intensity VARCHAR(20) CHECK (
        intensity IS NULL OR intensity IN ('low', 'medium', 'high')
    ),
    preferences TEXT,
    onboarding_done BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP DEFAULT NOW()
);
--WEIGHT LOGS

CREATE TABLE weight_logs(
    log_id SERIAL PRIMARY KEY,
    profile_id INT NOT NULL REFERENCES physical_profiles(profile_id) ON DELETE CASCADE,
    weight_kg NUMERIC(5,2) NOT NULL CHECK (weight_kg > 0 AND weight_kg < 500),
    recorded_at TIMESTAMP DEFAULT NOW()
);