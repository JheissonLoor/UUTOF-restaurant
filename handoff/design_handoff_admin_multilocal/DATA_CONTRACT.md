# DATA_CONTRACT — Admin Multi-local UTTOF

> Endpoints que consume el Admin Multi-local. Base: `http://localhost:8000/v1`.
> Requiere `Authorization: Bearer <jwt>` con rol `dueño` o `gerente_sucursal`.
> Mismo backend que Estándar/Pro. Este plan añade los endpoints marcados ⭐ y el parámetro `id_sucursal`.

---

## 🔐 Auth
### POST `/v1/auth/login`
```ts
{ email: string; password: string }   // dueno@uttof.pe
// response: { access_token, refresh_token, expires_in,
//   usuario: { id, nombre, rol: "dueño" | "gerente_sucursal", id_sucursal?: number } }
```

## Convención de ámbito
Casi todo endpoint acepta `?id_sucursal=<n>`. Omitirlo = **toda la red** (consolidado). `gerente_sucursal` queda forzado a su `id_sucursal` (el backend ignora otro valor).

---

## 🏢 Sucursales
### GET `/v1/sucursales`
```ts
Array<{
  id_sucursal: number;
  nombre: string;              // "Miraflores"
  direccion: string;
  color: "coral" | "mint" | "sky" | string;
  mesas: number;
  activa: boolean;
}>
```
### POST `/v1/sucursales`  ⭐  — crear local
### GET `/v1/sucursales/{id}` — detalle + stats

---

## 📊 Consolidado / métricas  ⭐
### GET `/v1/metricas/consolidado?rango=hoy|7d|30d`
```ts
{
  kpis: { ingresos: number; pedidos: number; ticket_prom: number; ocupacion: number;
          delta: { ingresos: number; pedidos: number; ticket_prom: number; ocupacion: number } }; // % vs periodo previo
  por_sucursal: Array<{
    id_sucursal: number; nombre: string; color: string;
    ingresos: number; pedidos: number; ocupacion: number;
    inventario_estado: "ok" | "bajo" | "critico";
    delta_semana: number;      // %
  }>;
}
```
WebSocket `metricas.tick` empuja actualizaciones cada ~60s.

---

## 🤖 Predicción de demanda (IA)  ⭐
### GET `/v1/ia/prediccion?id_sucursal=<n>`
```ts
{
  modelo: string;              // "v2.4"
  confianza: number;           // 0-100
  recalculado_en: string;      // ISO (cada noche 3am)
  pronostico: Array<{ hora: string; demanda: number }>;  // curva del día
  picos: string[];             // ["13-15h", "20-22h"]
  recomendaciones: Array<{
    id: string;
    tipo: "comprar" | "staff" | "menu";
    texto: string;             // "Comprar 8 kg de pescado para el pico de hoy"
    impacto: string;           // "+S/ 1,200 estimado"
  }>;
}
```
### POST `/v1/ia/recomendaciones/{id}/aplicar`  → `{ accion: "aceptar" | "descartar" }`

---

## 📦 Inventario  ⭐
### GET `/v1/inventario?id_sucursal=<n>`
```ts
Array<{
  id_insumo: number;
  nombre: string;
  descripcion?: string;        // "Rinde ~4 h de servicio"
  id_sucursal: number; sucursal: string;
  nivel_pct: number;           // 0-100
  stock: string;               // "3.2 kg"
  estado: "ok" | "bajo" | "critico";
  sugerido: string;            // cantidad de compra sugerida
}>
```
### POST `/v1/inventario/orden-compra`  ⭐
```ts
{ id_sucursal: number; items: Array<{ id_insumo: number; cantidad: string }> }
```
### Evento WebSocket `insumo.reportado` (desde KDS 86-board)
```ts
{ id_insumo: number; nombre: string; id_sucursal: number; nota: string }
// el Admin lo marca crítico al instante
```

---

## 📄 Reportes exportables  ⭐
### GET `/v1/reportes/{tipo}?rango=…&id_sucursal=…&formato=pdf|xlsx`
`tipo`: `ventas` | `productos` | `empleados` | `inventario`.
Responde `application/pdf` o `application/vnd.openxmlformats-...xlsx` (descarga directa).

---

## ⚙️ Configuración
### GET/PUT `/v1/config/general`
### Integraciones (API)  ⭐
`GET /v1/integraciones` → `Array<{ id, nombre, categoria:"contabilidad"|"delivery"|"facturacion", conectado: boolean }>`
`POST /v1/integraciones/{id}/conectar` → `{ api_key: string }` (valida y devuelve estado)
`POST /v1/api-keys` / `DELETE /v1/api-keys/{id}` — tokens del cliente para la API abierta.
### Marca blanca  ⭐
`PUT /v1/config/marca` → `{ logo_url: string; color_primario: string }` (aplica al tenant; afecta apps cliente/mesero).

---

## ❌ Errores
RFC 9457 Problem Details.

## 🔧 Convenciones
- snake_case en JSON. Moneda en enteros de soles o decimal string; formatear en front.
- Zona horaria America/Lima. Idioma es-PE.
- Multi-tenant: TODO se resuelve por el `id_sucursal` del token o el query param; nunca confiar solo en el front.
