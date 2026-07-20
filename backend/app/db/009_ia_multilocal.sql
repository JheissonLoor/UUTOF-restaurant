CREATE TABLE ia_recomendacion_accion (
  id_accion INT AUTO_INCREMENT PRIMARY KEY,
  id_recomendacion VARCHAR(100) NOT NULL,
  id_sucursal INT NULL,
  tipo ENUM('comprar', 'staff', 'menu') NOT NULL,
  accion ENUM('aceptar', 'descartar') NOT NULL,
  id_usuario INT NOT NULL,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uq_ia_recomendacion_accion UNIQUE (id_recomendacion),
  CONSTRAINT fk_ia_recomendacion_sucursal
    FOREIGN KEY (id_sucursal) REFERENCES sucursal(id_sucursal)
    ON DELETE CASCADE,
  CONSTRAINT fk_ia_recomendacion_usuario
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_ia_recomendacion_sucursal_fecha
  ON ia_recomendacion_accion(id_sucursal, creado_en);
