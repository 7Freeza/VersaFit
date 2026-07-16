--INSERT DATA

--OBJECTIVES 

INSERT INTO objectives (name , description) VALUES
  ('lose weight','Reduce body fat and improve body composition'),
  ('Build muscle','Increase muscle mass and strengh'),
  ('Improve cardio','Improve health and cardiovascular endurance'),
  ('Stay active','Stay active and reduce stress');

--USER DEMO PASSWORD (BCRYPT HASH)

INSERT INTO users (email, password_hash, full_name)VALUES
  {
    'dem@versafit.com',
    '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
    'Demo User'
  };

-- PHYSICAL PROFILES

INSERT INTO physical_profiles(
  user_id, objective_id, age, height_cm, sex,
  activity_level, intensity, preferences, onboarding_done
)VALUES(
  1,2,28,178.00,'M',
  'moderate', 'medium', 'gym,running', TRUE
);

--WEIGHT LOGS

INSERT INTO weight_logs (profile_id, weight_kg, recorded_at)VALUES
  (1, 75.00, NOW() - INTERVAL '14 days'),
  (1, 74.50, NOW() - INTERVAL '7 days'),
  (1, 74.00, NOW());

--HABITS

INSERT INTO habits (user_id, habit_type, name, target_frequency)VALUES
  (1, 'exercise' , 'weekly training', 4);

--TRAINING PLANS

INSERT INTO training_plans (habit_id, objective_id, duration_weeks, is_active)VALUES
  (1, 2, 4, TRUE)

--EXERCISE

INSERT INTO exercises (name, muscle_group, description)VALUES
  ('Bench Press', 'Chest', 'Brabell press on a flat bench'),
  ('Pull-ups', 'Back', 'Bodyweight pull-ups'),
  ('Military Press', 'Shoulders', 'Overhead barbell press'),
  ('Bicep Curl', 'Arms', 'Dumbbell bicep curls'),
  ('Squats', 'Legs', 'Barbell or bodyweight squats'),
  ('Deadlift', 'Legs', 'Conventional deadlift'),
  ('Luges', 'Legs', 'Walking or stationary lunges'),
  ('Plank', 'Core', 'Isometric core hold'),
  ('Jumping Jacks', 'Cardio', 'Full body warm-up cardio'),
  ('Burpees', 'Full body', 'Hight intensity full body movement'),
  ('Mountain Climbers', 'Cardio', 'Core and cardio drill'),
  ('Running Intervals', 'Cardio', 'Alternating spring and jog'),
  ('Cycling', 'Cardio', 'Indoor or outdoor cycling'),
  ('Yoga Flow', 'Flexibility', 'Gentle mobility flow'),
  ('Hip Stretch', 'Flexibility', 'Hip opener stretch');
  
--ROUTINE
INSERT INTO routine (plan_id, name, description, category, duration_min, estimated_kcal)VALUES
  (1, 'Full Upper Body', 'Chest, back, shoulders and arms in one powerful session.', 'strength', 450, 380),
  (1, 'Interval Run', 'Burn fat improve cardiovascualar endurace.', 'beginner', 30, 310)
  (1, 'HIIT Full Body', 'Hight intensity, maximum results in minimum time.', 'advacend', 20, 290),
  (1, 'Recovery Yoga', 'Reduce muscle tension and improve joint mobility.', 'all levels', 35, 120),
  (1, 'Legs and Glutes', 'Squats, deadlifts and lunges for strong legs.', 'intermediate', 50, 420),
  (1, 'Indoor Cycling', 'Pédal with music and burn calories with low impact', 'beginner', 40, 350)

--ROUTINE EXERCISES

INSERT INTO routine_exercises (routine_id, exercise_id, sets, reps, rest_seconds, sort_order)VALUES
  (1, 1, 4, 10, 90, 1),
  (1, 2, 3, 8, 90, 2),
  (1, 3, 3, 12, 60, 3),
  (1, 4, 3, 15, 45, 4),
  (2, 12, 1, 20, 60, 1),
  (2, 9, 3, 30, 30, 2),
  (2, 11, 3, 20, 30, 3),
  (3, 10, 4, 12, 30, 1),
  (3, 11, 4, 20, 30, 2),
  (3, 9, 3, 40, 20, 3),
  (3, 8, 3, 45, 30, 4),
  (4, 14, 1, 20, 0, 1),
  (4, 15, 2, 30, 15, 2),
  (4, 8, 2, 40, 20, 3),
  (5, 5, 4, 10, 90, 1),
  (5, 6, 3, 8, 120, 2),
  (5, 7, 3, 12, 60, 3),
  (6, 13, 1, 30, 0, 1),
  (6, 9, 2, 30, 30, 2);