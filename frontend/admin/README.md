# UTTOF Admin - Operación Pro

Panel administrativo dedicado para gestionar la operación del restaurante desde el backend real de UTTOF.

## Funciones

- Dashboard de ingresos, pedidos, ocupación, ticket promedio, top de platillos y actividad reciente.
- Gestión de carta, categorías, mesas, reservas, empleados y configuración.
- Reportes de ventas en pantalla por rango y granularidad.
- Autenticación JWT, renovación automática y acceso exclusivo del rol `admin`.
- Estados de carga, vacío, error y confirmaciones visuales.

Inventario, exportación PDF/Excel, IA de demanda y gestión de sedes pertenecen al plan Multi-local.

## Ejecutar

```powershell
npm.cmd install
npm.cmd run dev
```

URL: `http://127.0.0.1:5173`

Credenciales: `admin@uttof.pe` / `admin123`

## Validar

```powershell
npm.cmd run build
```
