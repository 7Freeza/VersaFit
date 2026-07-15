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

--HABITS

CREATE TABLE habits(
    habit_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    habit_type VARCHAR(30) NOT NULL CHECK(
        habit_type IN('exercise', 'sleep', 'nutrition', 'other')
    ),
    name VARCHAR(100) NOT NULL,
    target_frequency INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

--HABIT LOGS

CREATE TABLE habit_logs(
    log_id SERIAL PRIMARY KEY,
    habit_id INT NOT NULL REFERENCES habits(habit_id) ON DELETE CASCADE,
    log_date DATE NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    value NUMERIC(6,2),
    notes TEXT,
    UNIQUE(habit_id, log_date)
);


--TRAINING PLANS

CREATE TABLE training_plans(
    plan_id SERIAL PRIMARY KEY,
    habit_id INT NOT NULL REFERENCES habits(habit id) ON DELETE CASCADE,
    objective_id INT REFERENCES objectives(objective_id),
    duration_weeks INT DEFAULT 4,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

--ROUTINES

CREATE TABLE routines(
    routine_id SERIAL PRIMARY KEY,
    plan_id INT NOT NULL REFERENCES training_plans(plan_id) ON DELETE CASCADE,
    name VARCHAR(100)NOT NULL,
    description TEXT,
    category VARCHAR(40)DEFAULT 'strength',
    difficulty VARCHAR(30)DEFAULT 'beginner',
    duration_min INT DEFAULT 30,
    estimated_kcal INT DEFAULT 200
);

--EXERCISES

CREATE TABLE exercises(
    exercise_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    muscle_group VARCHAR(50),
    description TEXT,
    external_id VARCHAR(50)
);

--ROUTINE_EXERCISES

CREATE TABLE routine_exercises(
    routine_id INT NOT NULL REFERENCES routines(routine_id) ON DELETE CASCADE,
    exercise_id INT NOT NULL REFERENCES exercises(exercise_id) ON DELETE CASCADE,
    day_name VARCHAR(20) CHECK(
        day_name IS NULL OR day_name IN(
            'Monday' , 'Tuesday' , 'Wednesday' , 'Thursday',
            'Friday' , 'Saturday' , 'Sunday'
        )
    ),
    sets INT DEFAULT 3,
    reps INT DEFAULT 10,
    rest_seconds INT DEFAULT 60,
    sort_order INT DEFAULT 0,
    PRIMARY KEY (routine_id , exercise_id)
);

--WEEKLY SCHEDULE

CREATE TABLE weekly_schedule(
    schedule_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    day_name VARCHAR(20) NOT NULL CHECK(
        day_name IN(
            'Monday' , 'Tuesday' , 'Wednesday' , 'Thursday'
            'Friday' , 'Saturday' , 'Sunday'
        )
    ),
    routine_id INT REFERENCES routines(routine_id) ON DELETE SET NULL,
    is_rest_day BOOLEAN DEFAULT FALSE,
    UNIQUE (user_id , day_name)
);

--WORKOUT SESSIONS

CREATE TABLE workout_sessions(
    session_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    routine_id INT NOT NULL REFERENCES routines(routine_id) ON DELETE CASCADE,
    session_date DATE NOT NULL DEFAULT CURRENT_DATE,
    is_completed BOOLEAN DEFAULT FALSE,
    started_id TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    UNIQUE (user_id, routine_id, session_date)
);
