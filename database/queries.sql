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