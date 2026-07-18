# UTTOF Mesero - Operación Pro

Aplicación táctil dedicada para la atención de mesas y el cierre de cuentas en salón.

## Funciones

- Mesas asignadas con búsqueda, filtros y avisos en tiempo real.
- Apertura de mesa, comensales, detalle de pedido y agregado de platillos.
- Entrega por platillo listo y llamada a cocina.
- Cuenta QR para identificar el cobro desde la App Cliente.
- Cobro con tarjeta, Yape o efectivo y cálculo de cambio.
- Verificación de solicitudes de efectivo iniciadas por el cliente.
- JWT con refresh automático y acceso para `mesero` o `admin`.

Pago dividido, ranking, upselling y modo offline pertenecen al plan Multi-local.

## Ejecutar

```powershell
npm.cmd install
npm.cmd run dev
```

URL: `http://127.0.0.1:5174`

Credenciales: `mesero@uttof.pe` / `mesero123`

## Validar

```powershell
npm.cmd run build
```
