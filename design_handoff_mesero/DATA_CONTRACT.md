# Data Contract — App Mesero

> Endpoints que consume la app del Mesero. Base: `http://localhost:8000/v1`.
> Todos requieren `Authorization: Bearer <jwt>` con rol `mesero` (o `admin`).

---

## 🔐 Auth

### POST `/v1/auth/login`
```ts
// request
{ email: string; password: string }   // mesero@uttof.pe
// response 200
{ access_token: string; refresh_token: string; expires_in: number;
  usuario: { id_usuario: number; nombre: string; rol: "mesero" } }
```

---

## 🪑 Mesas

### GET `/v1/mesas?mesero_id=me`
Devuelve las mesas asignadas al mesero autenticado.
```ts
Array<{
  id_mesa: number;
  numero: number;
  zona: "salon" | "terraza" | "barra" | "privado";
  capacidad: number;
  estado: "libre" | "ocupada" | "reservada" | "lista" | "limpieza";
  // si está ocupada/lista:
  pedido_activo?: {
    id_pedido: number;
    comensales: number;
    abierto_en: string;       // ISO
    minutos: number;
    total: number;            // soles
    curso_actual: string;     // "Plato fuerte"
    items_count: number;
    en_cocina: number;        // # ítems en cocina
    alerta: number;           // 0 = sin alerta
    progreso: string;         // "Esperando entrada"
  };
}>
```

### PATCH `/v1/mesas/{id}/estado`
```ts
{ estado: "libre" | "ocupada" | "limpieza" }
```

### POST `/v1/mesas/{id}/sentar`
```ts
{ comensales: number }   // crea sesión de pedido, mesa -> ocupada
// response: { id_pedido: number }
```

---

## 📋 Pedidos

### GET `/v1/pedidos/{id}`
```ts
{
  id_pedido: number;
  id_mesa: number;
  estado: "creado" | "en_cocina" | "listo" | "entregado" | "pagado" | "cancelado";
  comensales: number;
  total: number;
  items: Array<{
    id_detalle: number;
    id_platillo: number;
    nombre: string;
    qty: number;
    price: number;            // unitario, soles
    nota: string | null;
    curso: string;            // "Entrada" | "Plato fuerte" | ...
    estado_item: "en_cocina" | "ready" | "delivered";
  }>;
}
```

### POST `/v1/pedidos/{id}/items`
Agrega ítems (mesero toma orden). Solo si el pedido NO está en cocina cerrada.
```ts
// request
{ items: Array<{ id_platillo: number; qty: number; nota?: string;
                 modificadores?: { temp?: string; guarnicion?: string } }> }
// efecto: ítems nacen en estado en_cocina; emite WebSocket al KDS
// response: pedido actualizado
```

### PATCH `/v1/pedidos/{id}/estado`
Transiciones de la máquina de estados.
```ts
{ transicion: "marcarListo" | "entregar" | "cancelar" }
// "entregar": rol mesero, listo -> entregado
```

### PATCH `/v1/pedidos/{id}/items/{id_detalle}/entregar`
Marca un ítem específico como entregado.

### POST `/v1/pedidos/{id}/llamar-cocina`
Notifica al KDS mediante el bus realtime.
```ts
// response
{ ok: true }
// evento emitido
{ tipo: "pedido.llamar_cocina"; id_pedido: number; id_mesa: number }
```

---

## 💳 Pagos

### POST `/v1/pedidos/{id}/cuenta`
Genera la cuenta congelada + QR para que el cliente pague desde su app.
```ts
// response: { folio: string; qr_url: string; total: number }
```

### POST `/v1/pagos`
```ts
// request
{
  id_pedido: number;
  metodo: "tarjeta" | "yape" | "efectivo" | "mixto";
  monto: number;
  propina: number;
  // solo efectivo (verificación del mesero):
  recibido?: number;        // con cuánto paga el cliente
}
// efecto:
//  - tarjeta/yape: pedido -> pagado al instante
//  - efectivo: el mesero confirma recepción -> pedido pagado, mesa libre
// response: { id_transaccion, cambio?: number, recibo: {...} }
```

---

## 🔌 WebSocket (Realtime)

Conectar a `ws://localhost:8000/ws?token=<jwt>`. Eventos entrantes:
```ts
type WSEvent =
  | { tipo: "pedido.listo";       id_pedido: number; id_mesa: number }
  | { tipo: "pedido.item_listo";  id_pedido: number; id_detalle: number }
  | { tipo: "pedido.pagado_app";  id_pedido: number; id_mesa: number }
  | { tipo: "mesa.checkin";       id_mesa: number; comensales: number };
```

---

## ❌ Errores

RFC 9457 Problem Details (igual que el resto de la API):
```ts
{ type: string; title: string; status: number; detail: string; instance: string }
```

## 🔧 Convenciones
- Moneda: soles (S/), formato `es-PE`, dos decimales en backend.
- IGV 18% incluido en precios.
- snake_case en JSON.
