ALTER TABLE pedido
  ADD COLUMN IF NOT EXISTS pausado BOOLEAN NOT NULL DEFAULT FALSE AFTER total,
  ADD COLUMN IF NOT EXISTS pausado_en DATETIME NULL AFTER pausado;

CREATE TABLE IF NOT EXISTS pedido_insumo_alerta (
  id_alerta INT AUTO_INCREMENT PRIMARY KEY,
  id_pedido INT NOT NULL,
  id_detalle INT NOT NULL,
  id_usuario INT NULL,
  nota VARCHAR(500) NOT NULL,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_alerta_pedido
    FOREIGN KEY (id_pedido) REFERENCES pedido(id_pedido)
    ON DELETE CASCADE,
  CONSTRAINT fk_alerta_detalle
    FOREIGN KEY (id_detalle) REFERENCES detalle_pedido(id_detalle)
    ON DELETE CASCADE,
  CONSTRAINT fk_alerta_usuario
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX IF NOT EXISTS idx_alerta_pedido ON pedido_insumo_alerta(id_pedido);
