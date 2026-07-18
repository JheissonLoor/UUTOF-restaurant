# UTTOF - Plan Estándar

Aplicación web todo-en-uno del plan **Estándar** de UTTOF. Cliente, Verificador, Cocina y Administrador ingresan desde la misma URL; la autenticación JWT dirige a cada persona al área permitida por su rol.

Este frontend está conectado al backend FastAPI real. No incluye funciones reservadas para Operación Pro o Multi-local, como aplicaciones independientes por rol, pagos divididos, exportación de reportes, KDS oscuro, cronómetros de urgencia o WebSocket de cocina.

## Roles y rutas

| Perfil visible | Rol técnico | Ruta principal | Funciones |
| --- | --- | --- | --- |
| Cliente | `cliente` | `/menu` | Carta, carrito, check-in, pedido, seguimiento, pago, reserva y reseña |
| Verificador | `mesero` | `/mesero` | Bandeja de cobros en efectivo, monto recibido, cambio y confirmación |
| Cocina | `cocina` | `/cocina` | Kanban simple de tres estados con actualización cada 30 segundos |
| Administrador | `admin` | `/admin` | Dashboard, menú, mesas, usuarios, reportes en pantalla y configuración |

El nombre técnico `mesero` se mantiene en JWT y base de datos por compatibilidad. En el plan Estándar su función visible es **Verificador de efectivo**, no una aplicación operativa de atención en mesa.

## Funciones incluidas

- Login, registro, persistencia de sesión y renovación automática del access token.
- Autorización por rol en rutas y endpoints.
- Carta conectada a categorías y platillos del backend, con moneda peruana `S/`.
- Check-in de mesa y creación del pedido directo a cocina.
- Seguimiento del pedido por polling cada 30 segundos.
- Checkout postpago con tarjeta, Yape o efectivo.
- Verificación del efectivo antes de marcar el pedido como pagado y liberar la mesa.
- Reservas y reseña del cliente.
- Cocina con columnas En espera, En preparación y Terminado.
- Administración de menú, mesas, usuarios y configuración del restaurante.
- Dashboard y reporte de ventas por rango, agrupado por día, semana o mes.
- Estados de carga, vacío, error y confirmaciones visuales.

## Stack

- React 18, TypeScript y Vite.
- Tailwind CSS con la identidad visual UTTOF.
- Axios y TanStack Query.
- React Router, Framer Motion, Lucide React y Sonner.
- Formato `es-PE`, moneda PEN y zona horaria `America/Lima`.

## Configuración

Crea `.env` a partir de `.env.example`:

```powershell
Copy-Item .env.example .env
```

```env
VITE_API_URL=http://localhost:8000/v1
```

## Ejecución

```powershell
cd "C:\Users\jheis\OneDrive\Desktop\UTTOF - Restaurant\frontend\standard"
npm.cmd install
npm.cmd run dev
```

URL local: `http://127.0.0.1:5178`

## Credenciales demo

| Perfil | Email | Contraseña |
| --- | --- | --- |
| Cliente | `cliente@uttof.pe` | `cliente123` |
| Verificador | `mesero@uttof.pe` | `mesero123` |
| Cocina | `cocina@uttof.pe` | `cocina123` |
| Administrador | `admin@uttof.pe` | `admin123` |

## Validación

```powershell
npm.cmd run lint
npm.cmd run build
```
