# UTTOF Cliente - Operación Pro

Aplicación móvil web para el comensal de UTTOF. Permite ingresar a una mesa, consultar la carta, enviar un pedido directo a cocina, seguir su estado y completar el checkout postpago.

## Funciones

- Autenticación JWT con renovación automática.
- Entrada walk-in por mesa con confirmación manual o simulación de QR.
- Carta conectada al backend, carrito persistente y notas por platillo.
- Pedido directo a cocina y seguimiento por WebSocket con respaldo por polling.
- Pago en tarjeta, Yape o efectivo; el efectivo queda pendiente de verificación por el mesero.
- Reservas y reseña posterior al pago.
- Formato peruano, moneda PEN y precios en `S/`.

El pago dividido, fidelización y pedidos programados pertenecen al plan Multi-local y no se muestran en esta aplicación Pro. La lectura de QR con cámara se incorporará al completar los tres planes.

## Ejecutar

```powershell
npm.cmd install
npm.cmd run dev
```

URL: `http://127.0.0.1:5176`

Credenciales: `cliente@uttof.pe` / `cliente123`

## Validar

```powershell
npm.cmd run lint
npm.cmd run build
```
