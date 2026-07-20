CREATE TABLE sucursal (
  id_sucursal INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  direccion VARCHAR(240) NOT NULL,
  color VARCHAR(24) NOT NULL DEFAULT 'coral',
  activa BOOLEAN NOT NULL DEFAULT TRUE,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO sucursal (id_sucursal, nombre, direccion, color, activa) VALUES
  (1, 'Miraflores', 'Av. La Mar 1240, Miraflores, Lima', 'coral', TRUE),
  (2, 'Barranco', 'Jr. Unión 320, Barranco, Lima', 'mint', TRUE),
  (3, 'San Isidro', 'Av. Conquistadores 780, San Isidro, Lima', 'sky', TRUE);

ALTER TABLE usuario
  MODIFY COLUMN rol ENUM(
    'cliente', 'mesero', 'cocina', 'admin', 'dueno', 'gerente_sucursal'
  ) NOT NULL DEFAULT 'cliente',
  ADD COLUMN id_sucursal INT NULL AFTER id_usuario,
  ADD CONSTRAINT fk_usuario_sucursal
    FOREIGN KEY (id_sucursal) REFERENCES sucursal(id_sucursal)
    ON DELETE SET NULL;

UPDATE usuario
SET id_sucursal = 1
WHERE rol IN ('mesero', 'cocina');

CREATE INDEX idx_usuario_sucursal ON usuario(id_sucursal);

ALTER TABLE mesa
  ADD COLUMN id_sucursal INT NULL AFTER id_mesa;

UPDATE mesa
SET id_sucursal = CASE
  WHEN numero <= 3 THEN 1
  WHEN numero <= 6 THEN 2
  ELSE 3
END;

ALTER TABLE mesa
  MODIFY COLUMN id_sucursal INT NOT NULL,
  DROP INDEX numero,
  ADD CONSTRAINT fk_mesa_sucursal
    FOREIGN KEY (id_sucursal) REFERENCES sucursal(id_sucursal)
    ON DELETE RESTRICT,
  ADD CONSTRAINT uq_mesa_sucursal_numero UNIQUE (id_sucursal, numero);

CREATE INDEX idx_mesa_sucursal_estado ON mesa(id_sucursal, estado);

ALTER TABLE insumo
  ADD COLUMN id_sucursal INT NULL AFTER id_insumo,
  ADD CONSTRAINT fk_insumo_sucursal
    FOREIGN KEY (id_sucursal) REFERENCES sucursal(id_sucursal)
    ON DELETE CASCADE;

UPDATE insumo SET id_sucursal = 1 WHERE id_sucursal IS NULL;

CREATE INDEX idx_insumo_sucursal ON insumo(id_sucursal);
