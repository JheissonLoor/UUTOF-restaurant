CREATE TABLE usuario (
  id_usuario INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  email VARCHAR(180) NOT NULL UNIQUE,
  password_hash CHAR(60) NOT NULL,
  telefono VARCHAR(20),
  rol ENUM('cliente', 'mesero', 'cocina', 'admin') NOT NULL DEFAULT 'cliente',
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE categoria (
  id_categoria INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(80) NOT NULL,
  orden SMALLINT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE platillo (
  id_platillo INT AUTO_INCREMENT PRIMARY KEY,
  id_categoria INT,
  nombre VARCHAR(120) NOT NULL,
  precio DECIMAL(10,2) NOT NULL CHECK (precio >= 0),
  disponible BOOLEAN NOT NULL DEFAULT TRUE,
  imagen_url TEXT,
  CONSTRAINT fk_platillo_categoria
    FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria)
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE mesa (
  id_mesa INT AUTO_INCREMENT PRIMARY KEY,
  numero INT NOT NULL UNIQUE,
  capacidad SMALLINT NOT NULL,
  estado ENUM('libre', 'ocupada', 'reservada', 'limpieza') NOT NULL DEFAULT 'libre'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE reserva (
  id_reserva INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT,
  id_mesa INT,
  hora_reserva DATETIME NOT NULL,
  num_personas SMALLINT NOT NULL CHECK (num_personas > 0),
  notas_especiales TEXT,
  CONSTRAINT fk_reserva_usuario
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
    ON DELETE SET NULL,
  CONSTRAINT fk_reserva_mesa
    FOREIGN KEY (id_mesa) REFERENCES mesa(id_mesa)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE pedido (
  id_pedido INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT,
  id_mesa INT,
  estado ENUM('creado', 'en_cocina', 'listo', 'entregado', 'pagado', 'cancelado') NOT NULL DEFAULT 'creado',
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_pedido_usuario
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario),
  CONSTRAINT fk_pedido_mesa
    FOREIGN KEY (id_mesa) REFERENCES mesa(id_mesa)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE detalle_pedido (
  id_detalle INT AUTO_INCREMENT PRIMARY KEY,
  id_pedido INT NOT NULL,
  id_platillo INT NOT NULL,
  cantidad SMALLINT NOT NULL CHECK (cantidad > 0),
  subtotal DECIMAL(10,2) NOT NULL,
  notas TEXT,
  CONSTRAINT fk_detalle_pedido
    FOREIGN KEY (id_pedido) REFERENCES pedido(id_pedido)
    ON DELETE CASCADE,
  CONSTRAINT fk_detalle_platillo
    FOREIGN KEY (id_platillo) REFERENCES platillo(id_platillo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE pago (
  id_transaccion INT AUTO_INCREMENT PRIMARY KEY,
  id_pedido INT UNIQUE,
  metodo ENUM('efectivo', 'tarjeta', 'yape', 'mixto') NOT NULL,
  monto DECIMAL(10,2) NOT NULL,
  propina DECIMAL(10,2) DEFAULT 0,
  fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_pago_pedido
    FOREIGN KEY (id_pedido) REFERENCES pedido(id_pedido)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE resena (
  id_resena INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT,
  id_pedido INT,
  calificacion INT CHECK (calificacion BETWEEN 1 AND 5),
  comentario TEXT,
  CONSTRAINT fk_resena_usuario
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario),
  CONSTRAINT fk_resena_pedido
    FOREIGN KEY (id_pedido) REFERENCES pedido(id_pedido)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE insumo (
  id_insumo INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(120),
  stock DECIMAL(10,2),
  unidad VARCHAR(20)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_pedido_estado ON pedido(estado);
