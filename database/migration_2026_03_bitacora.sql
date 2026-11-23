USE liga_estrellas;

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
