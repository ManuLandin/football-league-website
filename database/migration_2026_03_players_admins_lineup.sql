USE liga_estrellas;

-- Nuevos campos opcionales en jugadores
ALTER TABLE jugadores
  ADD COLUMN IF NOT EXISTS nombre_papa VARCHAR(160) NULL,
  ADD COLUMN IF NOT EXISTS nombre_mama VARCHAR(160) NULL,
  ADD COLUMN IF NOT EXISTS escuela VARCHAR(180) NULL,
  ADD COLUMN IF NOT EXISTS grado_escolar VARCHAR(80) NULL,
  ADD COLUMN IF NOT EXISTS telefono_casa VARCHAR(40) NULL,
  ADD COLUMN IF NOT EXISTS telefono_mama VARCHAR(40) NULL,
  ADD COLUMN IF NOT EXISTS telefono_papa VARCHAR(40) NULL,
  ADD COLUMN IF NOT EXISTS tipo_sanguineo VARCHAR(12) NULL,
  ADD COLUMN IF NOT EXISTS tarjetas_amarillas_acum TINYINT UNSIGNED NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS suspension_restante TINYINT UNSIGNED NOT NULL DEFAULT 0;

-- Marca interna para no aplicar disciplina dos veces por partido
ALTER TABLE partidos
  ADD COLUMN IF NOT EXISTS disciplina_aplicada TINYINT(1) NOT NULL DEFAULT 0;

-- Tabla para alineaciones y tarjetas del partido
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
