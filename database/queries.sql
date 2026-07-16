--inquiries

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