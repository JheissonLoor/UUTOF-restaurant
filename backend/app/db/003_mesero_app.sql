ALTER TABLE mesa
  ADD COLUMN id_mesero INT NULL AFTER id_mesa,
  ADD COLUMN zona ENUM('salon', 'terraza', 'barra', 'privado') NOT NULL DEFAULT 'salon' AFTER numero,
  MODIFY COLUMN estado ENUM('libre', 'ocupada', 'reservada', 'lista', 'limpieza') NOT NULL DEFAULT 'libre',
  ADD CONSTRAINT fk_mesa_mesero
    FOREIGN KEY (id_mesero) REFERENCES usuario(id_usuario)
    ON DELETE SET NULL;

CREATE INDEX idx_mesa_mesero ON mesa(id_mesero);

ALTER TABLE pedido
  ADD COLUMN comensales SMALLINT NOT NULL DEFAULT 1 AFTER id_mesa;

ALTER TABLE detalle_pedido
  ADD COLUMN curso VARCHAR(40) NOT NULL DEFAULT 'Plato fuerte' AFTER notas,
  ADD COLUMN estado_item ENUM('en_cocina', 'ready', 'delivered') NOT NULL DEFAULT 'en_cocina' AFTER curso;
