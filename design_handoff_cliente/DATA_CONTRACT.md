# Data Contract — App Cliente

> Base: `http://localhost:8000/v1`. Requiere `Authorization: Bearer <jwt>` rol `cliente` (excepto endpoints públicos de menú).

---

## 🔐 Auth
### POST `/v1/auth/register` · POST `/v1/auth/login`
```ts
// login response: { access_token, refresh_token, expires_in,
//   usuario: { id_usuario, nombre, rol: "cliente" } }
```

## 🪑 Check-in (walk-in)
### POST `/v1/mesas/{id}/checkin`
```ts
// response: { id_mesa: number; numero: number; zona: string; capacidad: number }
```

## 🍽️ Menú (público)
### GET `/v1/menu/categorias`
### GET `/v1/menu/platillos?categoria_id=&limit=&cursor=`
```ts
Array<{
  id_platillo: number; nombre: string; categoria: string;
  descripcion: string; precio: number; imagen_url: string;
  tiempo_prep: number; disponible: boolean;
}>
```

## 📋 Pedidos
### POST `/v1/pedidos`
```ts
// request
{ id_mesa: number; items: Array<{ id_platillo: number; qty: number; nota?: string }> }
// efecto: ítems nacen en_cocina; emite WebSocket al KDS
// response: { id_pedido, estado, total, folio }
```
### POST `/v1/pedidos/{id}/items`   (agregar a pedido abierto de la mesa)
### GET `/v1/pedidos/{id}`   (para el tracker)
```ts
{ id_pedido, estado, total, items: [{ nombre, qty, estado_item }], mesero?: string }
```

## 💳 Cuenta / Pago (postpago)
### POST `/v1/pedidos/{id}/cuenta`   → congela total + propina, folio
### POST `/v1/pagos`
```ts
{ id_pedido: number; metodo: "tarjeta"|"yape"|"efectivo"|"mixto"; monto: number; propina: number }
// tarjeta/yape: pedido -> pagado al instante
// efectivo: queda pendiente hasta que el mesero verifica (PATCH /pagos/{id}/verificar)
// response: { id_transaccion, recibo: {...} }
```

## 📅 Reservas
### POST `/v1/reservas`
```ts
{ id_mesa: number; hora_reserva: string; num_personas: number; notas?: string }
```
### GET `/v1/reservas?fecha=YYYY-MM-DD`   (disponibilidad)

## ⭐ Reseñas
### POST `/v1/resenas`
```ts
{ id_pedido: number; calificacion: 1|2|3|4|5; comentario?: string }
```

---

## 🔌 WebSocket
`ws://localhost:8000/ws?token=<jwt>`
```ts
type WSEvent =
  | { tipo: "pedido.item_listo"; id_pedido: number; id_detalle: number }
  | { tipo: "pedido.listo";      id_pedido: number }
  | { tipo: "pedido.entregado";  id_pedido: number }
  | { tipo: "pago.verificado";   id_pedido: number };
```

## Convenciones
- snake_case en JSON, soles (S/), UTC ISO-8601, RFC 9457 para errores.
- Persistir sesión de mesa + carrito en localStorage.
