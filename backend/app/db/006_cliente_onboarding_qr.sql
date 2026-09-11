ALTER TABLE usuario
  ADD COLUMN es_invitado BOOLEAN NOT NULL DEFAULT FALSE AFTER rol,
  ADD COLUMN expira_en DATETIME NULL AFTER es_invitado;

CREATE TABLE preferencia_cliente (
  id_usuario INT PRIMARY KEY,
  dieta ENUM('sin_restricciones', 'vegetariana', 'vegana', 'sin_gluten') NOT NULL DEFAULT 'sin_restricciones',
  cocinas JSON NOT NULL,
  actualizado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_preferencia_cliente_usuario
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE mesa
  ADD COLUMN qr_token CHAR(64) NULL AFTER estado,
  ADD COLUMN qr_codigo_corto CHAR(12) NULL AFTER qr_token;

UPDATE mesa
SET qr_token = LOWER(SHA2(CONCAT(UUID(), '-', id_mesa, '-', NOW(6)), 256)),
    qr_codigo_corto = UPPER(LEFT(SHA2(CONCAT(UUID(), '-', id_mesa), 256), 12))
WHERE qr_token IS NULL OR qr_codigo_corto IS NULL;

ALTER TABLE mesa
  MODIFY qr_token CHAR(64) NOT NULL,
  MODIFY qr_codigo_corto CHAR(12) NOT NULL,
  ADD CONSTRAINT uq_mesa_qr_token UNIQUE (qr_token),
  ADD CONSTRAINT uq_mesa_qr_codigo UNIQUE (qr_codigo_corto);

ALTER TABLE reserva
  ADD COLUMN estado ENUM('confirmada', 'validada', 'cancelada', 'completada') NOT NULL DEFAULT 'confirmada' AFTER notas_especiales,
  ADD COLUMN qr_token CHAR(64) NULL AFTER estado,
  ADD COLUMN creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER qr_token;

UPDATE reserva
SET qr_token = LOWER(SHA2(CONCAT(UUID(), '-', id_reserva, '-', NOW(6)), 256))
WHERE qr_token IS NULL;

ALTER TABLE reserva
  MODIFY qr_token CHAR(64) NOT NULL,
  ADD CONSTRAINT uq_reserva_qr_token UNIQUE (qr_token);

CREATE INDEX idx_reserva_estado_hora ON reserva(estado, hora_reserva);
