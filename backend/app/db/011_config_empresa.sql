CREATE TABLE integracion (
  id_integracion INT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(40) NOT NULL UNIQUE,
  nombre VARCHAR(100) NOT NULL,
  categoria ENUM('contabilidad', 'delivery', 'facturacion') NOT NULL,
  descripcion VARCHAR(240) NOT NULL,
  color VARCHAR(24) NOT NULL DEFAULT 'sky',
  activa BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO integracion (codigo, nombre, categoria, descripcion, color) VALUES
  ('contabilium', 'Contabilium', 'contabilidad', 'Sincroniza ventas e ingresos diarios por sucursal.', 'sky'),
  ('sunat', 'SUNAT · Facturación', 'facturacion', 'Emite boletas y facturas electrónicas al cerrar cada cuenta.', 'coral'),
  ('rappi', 'Rappi', 'delivery', 'Recibe pedidos de delivery en la operación central.', 'mint'),
  ('pedidosya', 'PedidosYa', 'delivery', 'Centraliza pedidos y estados de despacho.', 'plum'),
  ('nubefact', 'Nubefact', 'facturacion', 'Integra comprobantes electrónicos y series autorizadas.', 'sun'),
  ('yape', 'Yape Empresas', 'facturacion', 'Relaciona cobros digitales con cierres de caja.', 'ink');

CREATE TABLE integracion_estado (
  id_integracion INT PRIMARY KEY,
  conectado BOOLEAN NOT NULL DEFAULT FALSE,
  credencial_hash CHAR(64) NULL,
  credencial_hint VARCHAR(16) NULL,
  actualizado_por INT NULL,
  actualizado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_integracion_estado_integracion
    FOREIGN KEY (id_integracion) REFERENCES integracion(id_integracion)
    ON DELETE CASCADE,
  CONSTRAINT fk_integracion_estado_usuario
    FOREIGN KEY (actualizado_por) REFERENCES usuario(id_usuario)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO integracion_estado (id_integracion, conectado)
SELECT id_integracion, FALSE FROM integracion;

CREATE TABLE api_key_cliente (
  id_api_key INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  token_hash CHAR(64) NOT NULL UNIQUE,
  token_prefix VARCHAR(24) NOT NULL,
  token_ultimos4 CHAR(4) NOT NULL,
  creada_por INT NOT NULL,
  creada_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ultimo_uso DATETIME NULL,
  activa BOOLEAN NOT NULL DEFAULT TRUE,
  CONSTRAINT fk_api_key_usuario
    FOREIGN KEY (creada_por) REFERENCES usuario(id_usuario)
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_api_key_activa ON api_key_cliente(activa, creada_en);

CREATE TABLE config_general_multilocal (
  id_config TINYINT PRIMARY KEY,
  nombre_comercial VARCHAR(120) NOT NULL,
  ruc CHAR(11) NOT NULL,
  email VARCHAR(120) NOT NULL,
  telefono VARCHAR(32) NOT NULL,
  direccion VARCHAR(180) NOT NULL,
  horario_apertura TIME NOT NULL,
  horario_cierre TIME NOT NULL,
  timezone VARCHAR(40) NOT NULL DEFAULT 'America/Lima',
  actualizado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO config_general_multilocal
  (id_config, nombre_comercial, ruc, email, telefono, direccion, horario_apertura, horario_cierre, timezone)
VALUES
  (1, 'UTTOF Restaurante', '20123456789', 'hola@uttof.pe', '+51 979 233 501',
   'Av. Larco 123, Miraflores, Lima', '11:00:00', '23:00:00', 'America/Lima');

CREATE TABLE marca_config (
  id_config TINYINT PRIMARY KEY,
  nombre_marca VARCHAR(120) NOT NULL,
  logo_url LONGTEXT NULL,
  color_primario CHAR(7) NOT NULL DEFAULT '#E94B33',
  subdominio VARCHAR(63) NOT NULL DEFAULT 'uttof',
  actualizado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO marca_config (id_config, nombre_marca, logo_url, color_primario, subdominio)
VALUES (1, 'UTTOF', NULL, '#E94B33', 'uttof');

CREATE TABLE facturacion_config (
  id_config TINYINT PRIMARY KEY,
  plan VARCHAR(60) NOT NULL,
  precio_por_local DECIMAL(10,2) NOT NULL,
  metodo_pago VARCHAR(80) NOT NULL,
  ultimos4 CHAR(4) NOT NULL,
  proxima_factura DATE NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO facturacion_config
  (id_config, plan, precio_por_local, metodo_pago, ultimos4, proxima_factura)
VALUES
  (1, 'Multi-local', 599.00, 'Visa', '4242', DATE_ADD(CURRENT_DATE, INTERVAL 1 MONTH));
