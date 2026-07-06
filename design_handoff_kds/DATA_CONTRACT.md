# Data Contract — KDS Cocina

> Endpoints que consume el KDS. Base: `http://localhost:8000/v1`.
> Requiere `Authorization: Bearer <jwt>` con rol `cocina` (o `admin`).

---

## 🔐 Auth

### POST `/v1/auth/login`
```ts
{ email: string; password: string }   // cocina@uttof.pe
// response: { access_token, refresh_token, expires_in, usuario: { rol: "cocina" } }
```

---

## 🎫 Tickets (pedidos en cocina)

### GET `/v1/pedidos?estado=en_cocina,listo`
Tickets activos para el board.
```ts
Array<{
  id_pedido: number;
  num: number;                 // folio corto para mostrar (#89)
  id_mesa: number;
  mesa: string;                 // "Mesa 5"
  origen: "app_cliente" | "mesero";
  mesero: string;               // nombre del mesero responsable
  estado: "creado" | "en_cocina" | "listo";
  creado_en: string;            // ISO — para calcular elapsed
  target_seg: number;           // tiempo objetivo de preparación
  items: Array<{
    id_detalle: number;
    nombre: string;
    qty: number;
    modificadores: string[];    // ["Término medio"]
    nota?: string;              // "Sin frambuesas"
    alergenos?: string[];       // ["lácteos", "gluten"]
    listo: boolean;
  }>;
}>
```

### PATCH `/v1/pedidos/{id}/items/{id_detalle}`
Marca/desmarca un ítem individual.
```ts
{ listo: boolean }
// efecto: si todos los items quedan listo=true, el pedido pasa a "listo"
//         automáticamente y se emite WebSocket pedido.listo
```

### PATCH `/v1/pedidos/{id}/estado`
```ts
{ transicion: "marcarListo" | "entregar" }
```

### POST `/v1/pedidos/{id}/reportar-insumo`
```ts
{ id_detalle: number; nota: string }
// notifica a mesero + admin
```

### PATCH `/v1/pedidos/{id}/pausar`
```ts
{ pausado: boolean }
```

---

## 🔌 WebSocket (Realtime)

Conectar a `ws://localhost:8000/ws?token=<jwt>`.

```ts
type WSEvent =
  | { tipo: "pedido.creado";          pedido: TicketPayload }
  | { tipo: "pedido.items_agregados"; id_pedido: number; items: ItemPayload[] }
  | { tipo: "pedido.cancelado";       id_pedido: number };
```

El backend calcula `elapsed` del lado del cliente: `elapsed = (Date.now() - new Date(creado_en)) / 1000`, actualizado cada segundo con un `setInterval` local (no hace falta poll al backend para el cronómetro).

---

## ❌ Errores

RFC 9457 Problem Details, igual que el resto de la API.

## 🔧 Convenciones
- snake_case en JSON.
- Reconexión automática de WebSocket con backoff si se cae la conexión.
- Zona horaria: America/Lima.
