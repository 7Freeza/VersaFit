--queries

--List users with their physical profile and latest weight

SELECT
    u.user_id,
    u.full_name,
    u.email,
    p.age,
    p.height_cm,
    p.intensity,
    o.name AS objective,
        (
            SELECT w.weight_kg
            FROM weight_logs w
            WHERE W.profile_id = p.profile_id
            ORDER BY w.recorded_at DESC
            LIMIT 1
        ) AS latest_weight
FROM users u
LEFT JOIN physical_profiles p ON p.user_id = u.user_id
LEFT JOIN objectives o ON o.objective_id = p.objective_id
WHERE u.is_active = TRUE;

--Weight history for a user

SELECT
    w.weight_kg,
    w.recorded_at
FROM weight_logs w
JOIN physical_profiles p ON p.profile_id = w.profile_id
WHERE p.user_id = 1
ORDER BY w.recorded_at DESC;

--Active training plan with its routines

SELECT
    tp.plan_id,
    tp.duration_weeks,
    r.routine_id,
    r.name AS routine_name,
    r.category,
    r.difficulty,
    r.duration_min,
    r.estimated_kcal
FROM training_plans tp
JOIN routines r ON r.plan_id = tp.plan_id
WHERE tp.is_active = TRUE
  AND tp.habit_id IN (
      SELECT habit_id FROM habits WHERE user_id = 1 AND habit_type = 'exercise'
  )
ORDER BY r.routine_id;

--Exercises of a routine with sets and reps

SELECT 
    r.name AS routine_name,
    e.name AS exercise_name,
    e.muscle_group,
    re.sets,
    re.reps,
    re.rest_secods,
    re.sort_order
FROM routines r
JOIN routine_exercises re ON re.routine_id = r.routine_id
JOIN exercises e ON e.exercise_id = re.exercise_id
WHERE r.routine_id = 1
ORDER BY re.sort_order;
