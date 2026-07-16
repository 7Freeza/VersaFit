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

--Weekly schedule for a user

SELECT
    ws.day_name,
    ws.is_rest_day,
    r.name AS routine_name,
    r.category
FROM weekly_schedule ws
LEFT JOIN routines r ON r.routine_id = ws.routine_id
WHERE ws.user_id = 1
ORDER BY
    CASE ws.day_name
        WHEN 'Monday' THEN 1
        WHEN 'Tuesday' THEN 2
        WHEN 'Wednesday' THEN 3
        WHEN 'Thursday' THEN 4
        WHEN 'Friday' THEN 5
        WHEN 'Saturday' THEN 6
        WHEN 'Sunday' THEN 7
    END;

--Completed sessions this week

SELECT
    ws.session_date,
    r.name AS routine_name,
    ws.is_completed
FROM workout_sessions ws
JOIN routines r ON r.routine_id = ws.routine_id
WHERE ws.user_id = 1
  AND ws.session_date >= date_trunc('week', CURRENT_DATE)::date
ORDER BY ws.session_date;

--Checklist progress for a session

SELECT
    e.name AS exercise_name
    ec.is_done
FROM exercise_checkoffs ec
JOIN exercises e ON e.exercise_id = ec.exercise_id
WHERE ec.session_id = 1
ORDER BY e.name;

--Count of routines by category for a user

SELECT
    r.category,
    COUNT(*) AS total
FROM routines r
JOIN training_planes tp ON tp.plan_id = r.plan_id
JOIN habits h ON h.habit_id = tp.habit_id
WHERE h.user_id = 1
GROUP BY r.category;

