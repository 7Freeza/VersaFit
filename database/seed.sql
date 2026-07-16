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

