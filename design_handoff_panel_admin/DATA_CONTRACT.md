# Data Contract — Panel Admin

> Endpoints que el frontend del Panel Admin consume y sus tipos TypeScript.
> Base URL: `http://localhost:8000/v1` en desarrollo.
> Todos los endpoints (excepto `/auth/*`) requieren header `Authorization: Bearer <jwt>`.
> Los montos están expresados en Soles (`PEN`) y el frontend los presenta con locale `es-PE` y símbolo `S/`.

---

## 🔐 Auth

### POST `/v1/auth/login`

**Request:**
```ts
{
  email: string;     // ej. "admin@uttof.pe"
  password: string;  // mínimo 8 caracteres
}
```

**Response 200:**
```ts
{
  access_token: string;
  refresh_token: string;
  expires_in: number;  // segundos (default 900)
  usuario: {
    id_usuario: number;
    nombre: string;
    email: string;
    rol: "cliente" | "mesero" | "cocina" | "admin";
  };
}
```

**Errores:**
- `401` → credenciales inválidas
- `403` → cuenta deshabilitada

---

### POST `/v1/auth/refresh`

**Request:**
```ts
{ refresh_token: string }
```

**Response 200:** mismo shape que login.

---

## 📊 Dashboard

### GET `/v1/reportes/dashboard`

**Query params:** ninguno
**Permisos:** rol `admin`
**Response 200:**

```ts
{
  hoy: {
    ingresos: number;             // 18420.50
    ingresos_ayer: number;
    pedidos: number;              // 87
    pedidos_ayer: number;
    mesas_ocupadas: number;       // 8
    mesas_totales: number;        // 12
    ticket_promedio: number;      // 211.7
    ticket_promedio_ayer: number;
    pedidos_pendientes: number;
  };

  distribucion: Array<{
    key: "espera" | "preparacion" | "terminado" | "falta_pagar" | "pagado" | "cancelado";
    label: string;
    count: number;
  }>;

  ingresos_por_dia: {
    labels: string[];      // ["10","11",...,"hoy"]
    esta_semana: number[]; // 14 valores
    semana_anterior: number[];
  };

  top_platillos: Array<{
    id_platillo: number;
    nombre: string;
    categoria: string;
    cantidad: number;
    pct: number;     // relativo al top 1, 0..1
  }>;

  actividad: Array<{
    type: "order" | "pay" | "ready" | "reserve" | "review";
    who: string;          // "Mesa 5", "Cocina", "Reserva"
    what: string;         // descripción human-readable
    when: string;         // ISO timestamp del evento
    actor: string;        // iniciales del actor "MP"
  }>;

  alertas: Array<{
    level: "urgent" | "warn" | "info";
    title: string;
    sub: string;
    accionable?: boolean;
    accion_url?: string;
  }>;

  pagos_por_tipo: Array<{
    name: string;       // "Pagos Online", "Pagos en Efectivo"
    sub: string;        // "Tarjeta · transferencia"
    amount: number;
    pct: number;        // 0..100
  }>;

  heatmap_pedidos: number[][];  // 7 días × 24 horas
}
```

---

## 🍽️ Menú

### GET `/v1/menu/categorias`

**Response 200:**
```ts
Array<{
  id_categoria: number;
  nombre: string;
  orden: number;
}>
```

### GET `/v1/menu/platillos?categoria_id=&limit=&cursor=`

**Response 200:**
```ts
{
  data: Array<{
    id_platillo: number;
    id_categoria: number;
    nombre: string;
    precio: number;
    disponible: boolean;
    imagen_url: string | null;
  }>;
  next_cursor: string | null;
}
```

### POST `/v1/menu/platillos`

**Request:** mismos campos del platillo.
**Response 201:** el platillo creado.

### PATCH `/v1/menu/platillos/:id`

**Request:** campos a actualizar (parciales).
**Response 200:** el platillo actualizado.

---

## 🪑 Mesas

### GET `/v1/mesas`

**Response 200:**
```ts
Array<{
  id_mesa: number;
  numero: number;
  capacidad: number;
  estado: "libre" | "ocupada" | "reservada" | "limpieza";
  pedido_activo?: {
    id_pedido: number;
    total: number;
    tiempo_min: number;
    comensales: number;
  };
}>
```

### PATCH `/v1/mesas/:id/estado`

**Request:**
```ts
{ estado: "libre" | "ocupada" | "reservada" | "limpieza" }
```

---

## 📅 Reservas

### GET `/v1/reservas?fecha=YYYY-MM-DD`

**Response 200:**
```ts
Array<{
  id_reserva: number;
  id_usuario: number;
  nombre_cliente: string;
  id_mesa: number;
  hora_reserva: string;     // ISO
  num_personas: number;
  notas_especiales: string | null;
}>
```

---

## 👥 Usuarios

### GET `/v1/usuarios?rol=&limit=&cursor=`

**Response 200:**
```ts
{
  data: Array<{
    id_usuario: number;
    nombre: string;
    email: string;
    telefono: string | null;
    rol: "cliente" | "mesero" | "cocina" | "admin";
    creado_en: string;  // ISO
  }>;
  next_cursor: string | null;
}
```

### POST `/v1/usuarios`

**Permisos:** `admin`.

**Request:**
```ts
{
  nombre: string;
  email: string;
  telefono: string | null;
  password: string;
  rol: "cliente" | "mesero" | "cocina" | "admin";
}
```

**Response 201:** el usuario creado con el mismo tipo publico del listado.

### PATCH `/v1/usuarios/:id`

**Permisos:** dueno del usuario o `admin`. El campo `rol` solo puede cambiarlo un administrador.

**Request:**
```ts
{
  nombre?: string;
  telefono?: string | null;
  rol?: "cliente" | "mesero" | "cocina" | "admin";
}
```

**Response 200:** el usuario actualizado con el mismo tipo publico del listado.

> Nota: el esquema oficial actual no incluye una columna para activar o desactivar usuarios. Esa accion queda fuera de alcance hasta definir el cambio de base de datos.

---

## 📈 Reportes (vista detallada)

### GET `/v1/reportes/ventas?from=YYYY-MM-DD&to=YYYY-MM-DD&granularidad=dia|semana|mes`

**Response 200:**
```ts
{
  ingresos_total: number;
  pedidos_total: number;
  ticket_promedio: number;
  ingresos_por_periodo: Array<{ periodo: string; monto: number }>;
  pedidos_por_periodo: Array<{ periodo: string; cantidad: number }>;
  ticket_promedio_por_periodo: Array<{ periodo: string; monto: number }>;
  top_platillos: Array<{ id_platillo: number; nombre: string; cantidad: number; ingresos: number }>;
}
```

---

## Configuracion

### GET `/v1/configuracion`

Permisos: `admin`.

**Response 200:**
```ts
{
  restaurante: {
    nombre_comercial: string;
    ruc: string;
    direccion: string;
    telefono: string;
    email: string;
    timezone: "America/Lima";
    moneda: "PEN";
    igv_pct: number;
    horario_apertura: string;
    horario_cierre: string;
  };
  pagos: {
    acepta_efectivo: boolean;
    acepta_tarjeta: boolean;
    acepta_yape: boolean;
    yape_numero: string;
    pos_proveedor: string;
    propina_sugerida_pct: number;
    comprobante_default: "boleta" | "factura";
  };
  notificaciones: {
    email_admin: string;
    email_reservas: boolean;
    alertas_stock_bajo: boolean;
    sonido_cocina: boolean;
    resumen_diario_email: boolean;
  };
  seguridad: {
    sesion_minutos: number;
    mfa_admin: boolean;
    intentos_login: number;
    bloqueo_minutos: number;
    rotacion_claves_dias: number;
  };
}
```

### PATCH `/v1/configuracion`

Permisos: `admin`.

**Request:** mismo shape de `GET`, completo o parcial por seccion.

**Response 200:** configuracion actualizada.

> Persistencia actual: archivo local `backend/storage/configuracion.json`, ignorado por Git. No se agregaron tablas porque el modelo oficial de BD aun no define configuracion.

---

## ❌ Manejo de errores (RFC 9457 Problem Details)

Todas las respuestas de error siguen este formato:

```ts
{
  type: string;       // URL identificadora del tipo de error
  title: string;      // título human-readable
  status: number;     // código HTTP
  detail: string;     // descripción del error
  instance: string;   // URL de la request que falló
  // campos custom según el error:
  errors?: Record<string, string[]>;  // errores de validación
}
```

Ejemplo:
```json
{
  "type": "https://uttof.pe/errors/validation",
  "title": "Datos inválidos",
  "status": 422,
  "detail": "El campo precio debe ser mayor o igual a 0",
  "instance": "/v1/menu/platillos",
  "errors": { "precio": ["debe ser >= 0"] }
}
```

---

## 🔧 Headers comunes

| Header | Valor |
|---|---|
| `Authorization` | `Bearer <access_token>` |
| `Content-Type` | `application/json` |
| `Accept` | `application/json` |
| `X-Request-ID` | UUID opcional para trazabilidad |
