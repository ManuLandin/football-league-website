CREATE DATABASE IF NOT EXISTS liga_estrellas CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE liga_estrellas;

-- Administradores: super (control total) y de equipo (solo su club)
CREATE TABLE IF NOT EXISTS admins (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  rol ENUM('super', 'equipo') NOT NULL DEFAULT 'equipo',
  activo TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Equipos
CREATE TABLE IF NOT EXISTS equipos (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(160) NOT NULL,
  escudo_url VARCHAR(255),
  entrenador VARCHAR(160),
  telefono VARCHAR(40),
  email VARCHAR(160),
  ciudad VARCHAR(120),
  sede VARCHAR(180),
  descripcion TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Categorias de juego (ej. Sub-15, Sub-17)
CREATE TABLE IF NOT EXISTS categorias (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Relacion Equipo-Categoria (un equipo puede jugar en varias categorias)
CREATE TABLE IF NOT EXISTS equipo_categoria (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  equipo_id BIGINT UNSIGNED NOT NULL,
  categoria_id BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_equipo_categoria_equipo FOREIGN KEY (equipo_id) REFERENCES equipos(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_equipo_categoria_categoria FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE KEY uniq_equipo_categoria (equipo_id, categoria_id)
) ENGINE=InnoDB;
CREATE INDEX idx_equipo_categoria_categoria ON equipo_categoria (categoria_id);

-- Jugadores (ligados a un equipo dentro de una categoria)
CREATE TABLE IF NOT EXISTS jugadores (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  equipo_categoria_id BIGINT UNSIGNED NOT NULL,
  nombre VARCHAR(120) NOT NULL,
  apellidos VARCHAR(160) NOT NULL,
  nombre_papa VARCHAR(160),
  nombre_mama VARCHAR(160),
  escuela VARCHAR(180),
  grado_escolar VARCHAR(80),
  telefono_casa VARCHAR(40),
  telefono_mama VARCHAR(40),
  telefono_papa VARCHAR(40),
  tipo_sanguineo VARCHAR(12),
  fecha_nac DATE,                        -- Fecha de nacimiento (añadido)
  foto_url VARCHAR(255),                 -- URL fotografía (añadido)
  numero TINYINT UNSIGNED NOT NULL,
  estatura DECIMAL(4,2),                 -- metros
  peso DECIMAL(5,2),                     -- kilogramos
  alergias VARCHAR(255),
  tarjetas_amarillas_acum TINYINT UNSIGNED NOT NULL DEFAULT 0,
  suspension_restante TINYINT UNSIGNED NOT NULL DEFAULT 0,
  activo TINYINT(1) NOT NULL DEFAULT 1,  -- alta/baja sin perder historial
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_jugador_equipo_categoria FOREIGN KEY (equipo_categoria_id) REFERENCES equipo_categoria(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;
CREATE INDEX idx_jugadores_equipo_categoria ON jugadores (equipo_categoria_id);

-- Arbitros
CREATE TABLE IF NOT EXISTS arbitros (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  apellidos VARCHAR(160) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Jornadas
CREATE TABLE IF NOT EXISTS jornadas (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Partidos
CREATE TABLE IF NOT EXISTS partidos (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  equipo_categoria_local_id BIGINT UNSIGNED NOT NULL,
  equipo_categoria_visita_id BIGINT UNSIGNED NOT NULL,
  arbitro_id BIGINT UNSIGNED,
  jornada_id BIGINT UNSIGNED NOT NULL,
  fecha DATETIME NOT NULL,
  goles_local TINYINT UNSIGNED DEFAULT NULL,
  goles_visita TINYINT UNSIGNED DEFAULT NULL,
  comentario TEXT,
  estado ENUM('programado', 'jugado', 'cancelado') NOT NULL DEFAULT 'programado',
  disciplina_aplicada TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_partido_distintos_equipos CHECK (equipo_categoria_local_id <> equipo_categoria_visita_id),
  CONSTRAINT fk_partido_equipo_local FOREIGN KEY (equipo_categoria_local_id) REFERENCES equipo_categoria(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_partido_equipo_visita FOREIGN KEY (equipo_categoria_visita_id) REFERENCES equipo_categoria(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_partido_jornada FOREIGN KEY (jornada_id) REFERENCES jornadas(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_partido_arbitro FOREIGN KEY (arbitro_id) REFERENCES arbitros(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;
CREATE INDEX idx_partidos_fecha ON partidos (fecha);

-- Alineaciones y tarjetas por partido
CREATE TABLE IF NOT EXISTS partido_alineaciones (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  partido_id BIGINT UNSIGNED NOT NULL,
  jugador_id BIGINT UNSIGNED NOT NULL,
  equipo_categoria_id BIGINT UNSIGNED NOT NULL,
  lado ENUM('local', 'visita') NOT NULL,
  amarillas TINYINT UNSIGNED NOT NULL DEFAULT 0,
  roja TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_alineacion_partido FOREIGN KEY (partido_id) REFERENCES partidos(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_alineacion_jugador FOREIGN KEY (jugador_id) REFERENCES jugadores(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_alineacion_ec FOREIGN KEY (equipo_categoria_id) REFERENCES equipo_categoria(id) ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE KEY uniq_partido_jugador (partido_id, jugador_id)
) ENGINE=InnoDB;
CREATE INDEX idx_alineacion_partido ON partido_alineaciones (partido_id);
CREATE INDEX idx_alineacion_ec ON partido_alineaciones (equipo_categoria_id);

-- Tabla de posiciones por equipo-categoria
CREATE TABLE IF NOT EXISTS tabla_posiciones (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  equipo_categoria_id BIGINT UNSIGNED NOT NULL,
  pj SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  g SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  e SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  p SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  gf SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  gc SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  puntos SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_tabla_equipo_categoria FOREIGN KEY (equipo_categoria_id) REFERENCES equipo_categoria(id) ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE KEY uniq_tabla_equipo_categoria (equipo_categoria_id)
) ENGINE=InnoDB;

-- Noticias del sitio (editable desde admin)
CREATE TABLE IF NOT EXISTS noticias (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(200) NOT NULL,
  contenido TEXT NOT NULL,
  imagen_url VARCHAR(255),
  orden TINYINT UNSIGNED NOT NULL DEFAULT 0,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;
CREATE INDEX idx_noticias_orden ON noticias (orden);

-- Eventos del hero (editable desde admin)
CREATE TABLE IF NOT EXISTS eventos (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(200) NOT NULL,
  contenido TEXT NOT NULL,
  imagen_url VARCHAR(255),
  orden TINYINT UNSIGNED NOT NULL DEFAULT 0,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;
CREATE INDEX idx_eventos_orden ON eventos (orden);

-- Bitácora de cambios administrativos
CREATE TABLE IF NOT EXISTS bitacora_cambios (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  admin_id BIGINT UNSIGNED NULL,
  admin_nombre VARCHAR(160) NOT NULL,
  admin_rol ENUM('super', 'equipo') NOT NULL,
  accion VARCHAR(120) NOT NULL,
  detalle TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_bitacora_created_at (created_at),
  INDEX idx_bitacora_admin_rol (admin_rol)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS admin_equipos (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  admin_id BIGINT UNSIGNED NOT NULL,
  equipo_id BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_admin_equipo_admin FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_admin_equipo_equipo FOREIGN KEY (equipo_id) REFERENCES equipos(id) ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE KEY uniq_admin_equipo (admin_id, equipo_id),
  UNIQUE KEY uniq_equipo_admin (equipo_id)
) ENGINE=InnoDB;
