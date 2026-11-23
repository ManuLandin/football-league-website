-- ============================================================
-- Datos de ejemplo — Liga de las Estrellas
-- Ejecuta en phpMyAdmin → Base de datos liga_estrellas
-- ============================================================
USE liga_estrellas;

-- ── Equipo: FC Barcelona ─────────────────────────────────────────────────────
INSERT INTO equipos (nombre, entrenador, escudo_url) VALUES
  ('FC Barcelona', 'Hansi Flick', NULL);

SET @bcn_id = LAST_INSERT_ID();

-- ── Categorías globales ───────────────────────────────────────────────────────
INSERT IGNORE INTO categorias (nombre) VALUES ('Sub-10'), ('Sub-12'), ('Sub-15');

SET @cat10 = (SELECT id FROM categorias WHERE nombre = 'Sub-10');
SET @cat12 = (SELECT id FROM categorias WHERE nombre = 'Sub-12');
SET @cat15 = (SELECT id FROM categorias WHERE nombre = 'Sub-15');

-- ── Relacionar equipo ↔ categorías ────────────────────────────────────────────
INSERT INTO equipo_categoria (equipo_id, categoria_id) VALUES
  (@bcn_id, @cat10),
  (@bcn_id, @cat12),
  (@bcn_id, @cat15);

SET @ec10 = (SELECT id FROM equipo_categoria WHERE equipo_id = @bcn_id AND categoria_id = @cat10);
SET @ec12 = (SELECT id FROM equipo_categoria WHERE equipo_id = @bcn_id AND categoria_id = @cat12);
SET @ec15 = (SELECT id FROM equipo_categoria WHERE equipo_id = @bcn_id AND categoria_id = @cat15);

-- ── Jugadores Sub-10 ──────────────────────────────────────────────────────────
INSERT INTO jugadores (equipo_categoria_id, nombre, apellidos, numero, fecha_nac, estatura, peso, alergias) VALUES
  (@ec10, 'Andrés',  'López Martínez',    1,  '2016-03-12', 1.30, 28.0, 'Ninguna'),
  (@ec10, 'Carlos',  'Pérez Rodríguez',   5,  '2016-07-04', 1.28, 27.5, 'Ninguna'),
  (@ec10, 'Diego',   'García Sánchez',    9,  '2015-11-20', 1.32, 29.0, 'Polen'),
  (@ec10, 'Ernesto', 'Ruiz Torres',       7,  '2016-01-15', 1.27, 26.0, 'Ninguna'),
  (@ec10, 'Felipe',  'Mendoza Castro',    10, '2015-09-30', 1.33, 30.0, 'Lactosa');

-- ── Jugadores Sub-12 ──────────────────────────────────────────────────────────
INSERT INTO jugadores (equipo_categoria_id, nombre, apellidos, numero, fecha_nac, estatura, peso, alergias) VALUES
  (@ec12, 'Gabriel', 'Hernández Reyes',   1,  '2013-04-22', 1.48, 38.0, 'Ninguna'),
  (@ec12, 'Hugo',    'Vega Morales',      4,  '2013-08-16', 1.45, 36.5, 'Ninguna'),
  (@ec12, 'Iván',    'Castillo Jiménez',  9,  '2014-02-08', 1.50, 40.0, 'Maní'),
  (@ec12, 'Javier',  'Romero Flores',     7,  '2013-12-01', 1.47, 37.0, 'Ninguna'),
  (@ec12, 'Kevin',   'Serrano Ortiz',     11, '2014-05-19', 1.46, 37.5, 'Gluten');

-- ── Jugadores Sub-15 ──────────────────────────────────────────────────────────
INSERT INTO jugadores (equipo_categoria_id, nombre, apellidos, numero, fecha_nac, estatura, peso, alergias) VALUES
  (@ec15, 'Luis',   'Navarro Guzmán',    1,  '2010-06-14', 1.68, 55.0, 'Ninguna'),
  (@ec15, 'Marco',  'Delgado Paredes',   5,  '2011-01-23', 1.65, 52.0, 'Ninguna'),
  (@ec15, 'Nacho',  'Ríos Contreras',    9,  '2010-09-07', 1.70, 58.0, 'Ninguna'),
  (@ec15, 'Óscar',  'Fuentes Vargas',    7,  '2011-03-30', 1.63, 50.0, 'Polen'),
  (@ec15, 'Pablo',  'Aguilar Ramos',     10, '2010-11-11', 1.72, 60.0, 'Ninguna');

-- ── Árbitro de ejemplo ────────────────────────────────────────────────────────
INSERT INTO arbitros (nombre, apellidos) VALUES
  ('Roberto',  'Saldaña Méndez'),
  ('Patricia', 'Villanueva Cruz');

-- ── Tabla de posiciones inicial (Sub-10) ─────────────────────────────────────
INSERT INTO tabla_posiciones (equipo_categoria_id, pj, g, e, p, gf, gc, puntos) VALUES
  (@ec10, 0, 0, 0, 0, 0, 0, 0),
  (@ec12, 0, 0, 0, 0, 0, 0, 0),
  (@ec15, 0, 0, 0, 0, 0, 0, 0);

SELECT 'Datos de ejemplo insertados correctamente.' AS resultado;
