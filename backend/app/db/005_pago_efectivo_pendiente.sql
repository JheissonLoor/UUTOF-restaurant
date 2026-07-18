ALTER TABLE pago
  ADD COLUMN estado ENUM('pendiente', 'verificado') NOT NULL DEFAULT 'verificado' AFTER propina,
  ADD COLUMN recibido DECIMAL(10,2) NULL AFTER estado,
  ADD COLUMN detalle_metodos JSON NULL AFTER recibido,
  ADD COLUMN verificado_por INT NULL AFTER detalle_metodos,
  ADD COLUMN verificado_en DATETIME NULL AFTER verificado_por,
  ADD CONSTRAINT fk_pago_verificador
    FOREIGN KEY (verificado_por) REFERENCES usuario(id_usuario)
    ON DELETE SET NULL;

CREATE INDEX idx_pago_estado ON pago(estado);
