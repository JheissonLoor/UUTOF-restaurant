INSERT INTO insumo (nombre, stock, unidad)
SELECT 'Pescado fresco', 24, 'kg' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM insumo WHERE nombre = 'Pescado fresco');
INSERT INTO insumo (nombre, stock, unidad)
SELECT 'Arroz', 45, 'kg' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM insumo WHERE nombre = 'Arroz');
INSERT INTO insumo (nombre, stock, unidad)
SELECT 'Papa amarilla', 36, 'kg' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM insumo WHERE nombre = 'Papa amarilla');
INSERT INTO insumo (nombre, stock, unidad)
SELECT 'Limón', 20, 'kg' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM insumo WHERE nombre = 'Limón');
INSERT INTO insumo (nombre, stock, unidad)
SELECT 'Carne de res', 28, 'kg' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM insumo WHERE nombre = 'Carne de res');
INSERT INTO insumo (nombre, stock, unidad)
SELECT 'Aceite vegetal', 18, 'L' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM insumo WHERE nombre = 'Aceite vegetal');
INSERT INTO insumo (nombre, stock, unidad)
SELECT 'Cebolla roja', 22, 'kg' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM insumo WHERE nombre = 'Cebolla roja');
INSERT INTO insumo (nombre, stock, unidad)
SELECT 'Ají amarillo', 12, 'kg' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM insumo WHERE nombre = 'Ají amarillo');

CREATE TABLE inventario_sucursal (
  id_inventario INT AUTO_INCREMENT PRIMARY KEY,
  id_sucursal INT NOT NULL,
  id_insumo INT NOT NULL,
  descripcion VARCHAR(220) NULL,
  stock_actual DECIMAL(10,2) NOT NULL DEFAULT 0,
  stock_maximo DECIMAL(10,2) NOT NULL,
  unidad VARCHAR(20) NOT NULL,
  actualizado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_inventario_sucursal
    FOREIGN KEY (id_sucursal) REFERENCES sucursal(id_sucursal)
    ON DELETE CASCADE,
  CONSTRAINT fk_inventario_insumo
    FOREIGN KEY (id_insumo) REFERENCES insumo(id_insumo)
    ON DELETE RESTRICT,
  CONSTRAINT uq_inventario_sucursal_insumo UNIQUE (id_sucursal, id_insumo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO inventario_sucursal
  (id_sucursal, id_insumo, descripcion, stock_actual, stock_maximo, unidad)
SELECT
  s.id_sucursal,
  i.id_insumo,
  CONCAT('Control de stock de ', LOWER(i.nombre)),
  ROUND(
    GREATEST(COALESCE(i.stock, 10), 10) * CASE
      WHEN s.id_sucursal = 1 AND MOD(i.id_insumo, 7) = 1 THEN 0.12
      WHEN s.id_sucursal = 2 AND MOD(i.id_insumo, 5) = 2 THEN 0.28
      WHEN s.id_sucursal = 3 AND MOD(i.id_insumo, 6) = 3 THEN 0.10
      WHEN s.id_sucursal = 1 THEN 0.78
      WHEN s.id_sucursal = 2 THEN 0.54
      ELSE 0.72
    END,
    2
  ),
  GREATEST(COALESCE(i.stock, 10), 10),
  COALESCE(i.unidad, 'unidad')
FROM sucursal s
CROSS JOIN insumo i
WHERE s.activa = TRUE;

CREATE INDEX idx_inventario_sucursal_nivel
  ON inventario_sucursal(id_sucursal, stock_actual);

CREATE TABLE orden_compra (
  id_orden INT AUTO_INCREMENT PRIMARY KEY,
  id_sucursal INT NOT NULL,
  creado_por INT NOT NULL,
  estado ENUM('generada', 'enviada', 'recibida', 'cancelada') NOT NULL DEFAULT 'generada',
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_orden_sucursal
    FOREIGN KEY (id_sucursal) REFERENCES sucursal(id_sucursal)
    ON DELETE RESTRICT,
  CONSTRAINT fk_orden_usuario
    FOREIGN KEY (creado_por) REFERENCES usuario(id_usuario)
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE orden_compra_detalle (
  id_detalle_orden INT AUTO_INCREMENT PRIMARY KEY,
  id_orden INT NOT NULL,
  id_insumo INT NOT NULL,
  cantidad DECIMAL(10,2) NOT NULL,
  unidad VARCHAR(20) NOT NULL,
  CONSTRAINT fk_orden_detalle_orden
    FOREIGN KEY (id_orden) REFERENCES orden_compra(id_orden)
    ON DELETE CASCADE,
  CONSTRAINT fk_orden_detalle_insumo
    FOREIGN KEY (id_insumo) REFERENCES insumo(id_insumo)
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
