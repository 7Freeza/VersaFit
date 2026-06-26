-- =============================================================================
-- seed.sql — Datos iniciales de demostración
-- =============================================================================
-- Propósito:
--   Poblar la base de datos con un usuario demo y datos de ejemplo para probar
--   el frontend y el backend sin registrarse manualmente.
--
-- Datos que inserta:
--   - 1 usuario demo (demo@proyecto.com / contraseña: demo123)
--   - Metas de hábitos, comidas y entrenamientos
--   - Progreso por módulo (general, productividad, nutrición, ejercicio)
--   - Hábitos y un registro de cumplimiento del día actual
--   - Comidas del día actual
--   - Rutinas de ejercicio y una sesión completada hoy
--
-- Models del backend que consumen estos datos:
--   usuarios          → user.model.js
--   metas             → goal.model.js
--   progreso_modulo   → progress.model.js
--   habitos           → productivity.model.js
--   habitos_registro  → productivity.model.js
--   comidas_registro  → nutrition.model.js
--   rutinas           → exercise.model.js
--   sesiones          → exercise.model.js
--
-- Orden de ejecución:
--   1. Ejecutar schema.sql primero (crea la base y las tablas).
--   2. Ejecutar este archivo (seed.sql) después.
--
-- Notas para DBeaver / MySQL:
--   - Ejecutar sobre la base `proyecto_integrador` ya creada por schema.sql.
--   - Los INSERT usan ON DUPLICATE KEY UPDATE para ser idempotentes (se puede
--     reejecutar sin duplicar filas clave).
--   - CURDATE() inserta registros con la fecha del día de ejecución.
--   - Credenciales demo: email demo@proyecto.com, contraseña demo123.
-- =============================================================================

USE proyecto_integrador;

-- -----------------------------------------------------------------------------
-- Usuario demo
-- Model: user.model.js
-- Password: demo123 (bcrypt generado para desarrollo)
-- -----------------------------------------------------------------------------
INSERT INTO usuarios (id, nombre, email, password_hash, peso, altura, objetivo)
VALUES
  (1, 'Usuario Demo', 'demo@proyecto.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 70.00, 175, 'mantener')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

-- -----------------------------------------------------------------------------
-- Metas del usuario demo
-- Model: goal.model.js
-- -----------------------------------------------------------------------------
INSERT INTO metas (usuario_id, tipo, meta_valor, progreso_valor) VALUES
  (1, 'habitos_semanales', 7, 4),
  (1, 'comidas_diarias', 4, 2),
  (1, 'entrenamientos_semanales', 3, 2);

-- -----------------------------------------------------------------------------
-- Progreso por módulo
-- Model: progress.model.js
-- -----------------------------------------------------------------------------
INSERT INTO progreso_modulo (usuario_id, modulo, porcentaje, mensaje) VALUES
  (1, 'general', 58, 'Buen ritmo, sigue así'),
  (1, 'productividad', 57, '4/7 hábitos semanales'),
  (1, 'nutricion', 50, '2/4 comidas registradas'),
  (1, 'ejercicio', 67, '2/3 entrenamientos completados')
ON DUPLICATE KEY UPDATE porcentaje = VALUES(porcentaje), mensaje = VALUES(mensaje);

-- -----------------------------------------------------------------------------
-- Hábitos de productividad
-- Model: productivity.model.js
-- -----------------------------------------------------------------------------
INSERT INTO habitos (id, usuario_id, titulo) VALUES
  (1, 1, 'Leer 20 minutos'),
  (2, 1, 'Planificar el día')
ON DUPLICATE KEY UPDATE titulo = VALUES(titulo);

-- -----------------------------------------------------------------------------
-- Registro de hábito completado hoy
-- Model: productivity.model.js
-- -----------------------------------------------------------------------------
INSERT INTO habitos_registro (habito_id, usuario_id, fecha) VALUES
  (2, 1, CURDATE())
ON DUPLICATE KEY UPDATE fecha = VALUES(fecha);

-- -----------------------------------------------------------------------------
-- Comidas registradas hoy
-- Model: nutrition.model.js
-- -----------------------------------------------------------------------------
INSERT INTO comidas_registro (usuario_id, nombre, calorias, fecha) VALUES
  (1, 'Avena con frutas', 350, CURDATE()),
  (1, 'Pollo con arroz', 520, CURDATE());

-- -----------------------------------------------------------------------------
-- Rutinas de ejercicio
-- Model: exercise.model.js
-- -----------------------------------------------------------------------------
INSERT INTO rutinas (id, usuario_id, nombre, descripcion) VALUES
  (1, 1, 'Full body principiante', '3 series x 12 repeticiones'),
  (2, 1, 'Cardio ligero', '20 minutos caminata rápida')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

-- -----------------------------------------------------------------------------
-- Sesión de rutina completada hoy
-- Model: exercise.model.js
-- -----------------------------------------------------------------------------
INSERT INTO sesiones (rutina_id, usuario_id, fecha) VALUES
  (2, 1, CURDATE())
ON DUPLICATE KEY UPDATE fecha = VALUES(fecha);