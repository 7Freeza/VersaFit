-- =============================================================================
-- schema.sql — Definición del esquema de base de datos
-- =============================================================================
-- Propósito:
--   Crear la base de datos `proyecto_integrador` y todas las tablas necesarias
--   para el proyecto integrador (usuarios, metas, progreso, hábitos, nutrición
--   y ejercicio).
--
-- Tablas que crea:
--   usuarios, metas, progreso_modulo, habitos, habitos_registro,
--   comidas_registro, rutinas, sesiones
--
-- Models del backend que usan cada tabla:
--   usuarios          → backend/src/models/user.model.js
--   metas             → backend/src/models/goal.model.js
--   progreso_modulo   → backend/src/models/progress.model.js
--   habitos           → backend/src/models/productivity.model.js
--   habitos_registro  → backend/src/models/productivity.model.js
--   comidas_registro  → backend/src/models/nutrition.model.js
--   rutinas           → backend/src/models/exercise.model.js
--   sesiones          → backend/src/models/exercise.model.js
--
-- Orden de ejecución:
--   1. Ejecutar este archivo (schema.sql) primero.
--   2. Luego ejecutar seed.sql para cargar datos de demostración.
--
-- Notas para DBeaver / MySQL:
--   - Abrir una conexión MySQL/MariaDB y ejecutar el script completo (Ctrl+Enter
--     o botón "Execute SQL Script").
--   - Requiere permisos para CREATE DATABASE y CREATE TABLE.
--   - Charset: utf8mb4 / collation: utf8mb4_unicode_ci.
--   - Las claves foráneas usan ON DELETE CASCADE; al borrar un usuario se eliminan
--     sus registros relacionados.
--   - Si la base ya existe, CREATE TABLE IF NOT EXISTS evita errores al reejecutar.
-- =============================================================================

CREATE DATABASE IF NOT EXISTS proyecto_integrador
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE proyecto_integrador;

-- -----------------------------------------------------------------------------
-- Tabla: usuarios
-- Model: user.model.js — autenticación, registro y perfil del usuario
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  peso DECIMAL(5,2) NULL,
  altura INT NULL,
  objetivo ENUM('perder_peso', 'mantener', 'ganar_musculo') DEFAULT 'mantener',
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- Tabla: metas
-- Model: goal.model.js — metas semanales/diarias del usuario (hábitos, comidas, entrenamientos)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS metas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  meta_valor DECIMAL(10,2) NOT NULL,
  progreso_valor DECIMAL(10,2) DEFAULT 0,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- -----------------------------------------------------------------------------
-- Tabla: progreso_modulo
-- Model: progress.model.js — porcentaje y mensaje de progreso por módulo (general, productividad, nutrición, ejercicio)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS progreso_modulo (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  modulo ENUM('general', 'productividad', 'nutricion', 'ejercicio') NOT NULL,
  porcentaje TINYINT UNSIGNED DEFAULT 0,
  mensaje VARCHAR(255) NULL,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  UNIQUE KEY uq_usuario_modulo (usuario_id, modulo)
);

-- -----------------------------------------------------------------------------
-- Tabla: habitos
-- Model: productivity.model.js — hábitos diarios del módulo de productividad
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS habitos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  titulo VARCHAR(150) NOT NULL,
  activo TINYINT(1) DEFAULT 1,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- -----------------------------------------------------------------------------
-- Tabla: habitos_registro
-- Model: productivity.model.js — registro de cumplimiento de hábitos por fecha
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS habitos_registro (
  id INT AUTO_INCREMENT PRIMARY KEY,
  habito_id INT NOT NULL,
  usuario_id INT NOT NULL,
  fecha DATE NOT NULL,
  FOREIGN KEY (habito_id) REFERENCES habitos(id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  UNIQUE KEY uq_habito_fecha (habito_id, fecha)
);

-- -----------------------------------------------------------------------------
-- Tabla: comidas_registro
-- Model: nutrition.model.js — comidas registradas con calorías por día
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS comidas_registro (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  nombre VARCHAR(150) NOT NULL,
  calorias INT DEFAULT 0,
  fecha DATE NOT NULL,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- -----------------------------------------------------------------------------
-- Tabla: rutinas
-- Model: exercise.model.js — rutinas de entrenamiento del usuario
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS rutinas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  nombre VARCHAR(150) NOT NULL,
  descripcion TEXT,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- -----------------------------------------------------------------------------
-- Tabla: sesiones
-- Model: exercise.model.js — sesiones completadas de una rutina por fecha
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sesiones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  rutina_id INT NOT NULL,
  usuario_id INT NOT NULL,
  fecha DATE NOT NULL,
  FOREIGN KEY (rutina_id) REFERENCES rutinas(id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  UNIQUE KEY uq_rutina_fecha (rutina_id, fecha)
);