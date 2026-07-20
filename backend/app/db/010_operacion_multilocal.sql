CREATE TABLE platillo_sucursal (
  id_platillo_sucursal INT AUTO_INCREMENT PRIMARY KEY,
  id_sucursal INT NOT NULL,
  id_platillo INT NOT NULL,
  precio DECIMAL(10,2) NOT NULL,
  disponible BOOLEAN NOT NULL DEFAULT TRUE,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  actualizado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uq_platillo_sucursal UNIQUE (id_sucursal, id_platillo),
  CONSTRAINT fk_platillo_sucursal_local
    FOREIGN KEY (id_sucursal) REFERENCES sucursal(id_sucursal)
    ON DELETE CASCADE,
  CONSTRAINT fk_platillo_sucursal_platillo
    FOREIGN KEY (id_platillo) REFERENCES platillo(id_platillo)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO platillo_sucursal (id_sucursal, id_platillo, precio, disponible, activo)
SELECT s.id_sucursal, p.id_platillo, p.precio, p.disponible, TRUE
FROM sucursal s
CROSS JOIN platillo p
WHERE s.activa = TRUE;

ALTER TABLE usuario
  ADD COLUMN activo BOOLEAN NOT NULL DEFAULT TRUE AFTER rol;

CREATE INDEX idx_platillo_sucursal_activo
  ON platillo_sucursal(id_sucursal, activo, disponible);

CREATE INDEX idx_usuario_sucursal_activo
  ON usuario(id_sucursal, activo);
