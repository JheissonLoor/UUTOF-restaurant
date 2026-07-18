# UTTOF - Plan Estándar

Frontend del **plan estándar** de UTTOF: una sola app web para el cliente del restaurante, con el diseño cálido de la marca y conectada al backend real (FastAPI) de UTTOF.

A diferencia de los frontends `cliente`, `mesero`, `cocina-basico` y `kds` (orientados a operación por rol), el plan estándar reúne el flujo del comensal en una experiencia unificada y sencilla.

## Stack

- React 18 + TypeScript + Vite.
- Tailwind CSS (tema de marca: terracota/olivo, Playfair Display + DM Sans).
- axios + @tanstack/react-query contra la API `/v1`.
- framer-motion, lucide-react, sonner.
- Localización Perú: moneda PEN (`S/`) vía `Intl.NumberFormat('es-PE')`, zona horaria `America/Lima`.

## Funcionalidades

- Autenticación real JWT (`/v1/auth/login`, `/register`, `/refresh`) con persistencia de sesión y refresh automático.
- Landing y registro de cliente.
- Carta conectada a `/v1/menu` (categorías + platillos) con precios en soles.
- Carrito persistente (localStorage) con buscador y filtros por categoría.
- Selección de mesa desde `/v1/mesas` con check-in (`/mesas/{id}/checkin`).
- Envío de pedido a cocina (`/v1/pedidos`) desde el carrito.
- Seguimiento del pedido con tracker de estado (recibido → cocina → listo → entregado → pagado), con polling automático.
- Checkout postpago con propina y pago (`/v1/pagos`: tarjeta, **Yape**, efectivo, mixto) + reseña (`/v1/resenas`).
- Reservas (`/v1/reservas`): formulario con mesa/fecha/hora/personas/notas y listado de reservas del día.
- Seguimiento del pedido en tiempo real por **WebSocket** (con reconexión automática y polling de respaldo).

### Pendiente (siguientes fases)

- Panel admin (dashboard/ventas desde `/v1/reportes`).

## Configuración

Copia `.env.example` a `.env` y ajusta la URL del backend si corre en otro host:

```bash
cp .env.example .env
```

```env
VITE_API_URL=http://localhost:8000/v1
VITE_WS_URL=ws://localhost:8000/ws
```

## Levantar en local

```bash
npm install
npm run dev
```

URL: `http://127.0.0.1:5178`

## Validaciones

```bash
npm run lint    # oxlint
npm run build   # tsc -b && vite build
```

## Credenciales demo

Las mismas del backend UTTOF: `cliente@uttof.pe / cliente123`, `admin@uttof.pe / admin123`.
