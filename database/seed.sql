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