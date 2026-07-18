# UTTOF Cliente - Operación Pro

Aplicación móvil web para el comensal de UTTOF. Permite ingresar a una mesa, consultar la carta, enviar un pedido directo a cocina, seguir su estado y completar el checkout postpago.

## Funciones

- Autenticación JWT con renovación automática.
- Entrada walk-in por mesa con escaneo QR mediante la cámara o ingreso manual.
- Carta conectada al backend, carrito persistente y notas por platillo.
- Pedido directo a cocina y seguimiento por WebSocket con respaldo por polling.
- Pago en tarjeta, Yape o efectivo; el efectivo queda pendiente de verificación por el mesero.
- Reservas y reseña posterior al pago.
- Formato peruano, moneda PEN y precios en `S/`.

El pago dividido, fidelización y pedidos programados pertenecen al plan Multi-local y no se muestran en esta aplicación Pro.

El QR de cada mesa usa el formato `uttof://mesa/{id_mesa}` y puede descargarse desde el detalle de la mesa en el Panel Admin. La cámara requiere permiso del usuario y un contexto seguro: HTTPS en despliegue o `localhost`/`127.0.0.1` durante el desarrollo.

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
