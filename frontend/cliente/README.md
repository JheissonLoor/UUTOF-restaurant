# UTTOF Cliente - Operación Pro

Aplicación web pública y móvil para clientes de UTTOF. Incluye portada del restaurante, cuenta opcional, carta pública, reservas, entrada por QR, pedido directo a cocina, seguimiento y checkout postpago.

## Funciones

- Portada pública, login, registro y preferencias peruanas persistentes.
- Sesión invitada segura que puede convertirse en cuenta sin perder pedidos.
- Autenticación JWT con renovación automática.
- Entrada walk-in por mesa con escaneo QR mediante la cámara o ingreso manual.
- Carta conectada al backend, carrito persistente y notas por platillo.
- Pedido directo a cocina y seguimiento por WebSocket con respaldo por polling.
- Pago en tarjeta, Yape o efectivo; el efectivo queda pendiente de verificación por el mesero.
- Reservas y reseña posterior al pago.
- Formato peruano, moneda PEN y precios en `S/`.

El pago dividido, fidelización y pedidos programados pertenecen al plan Multi-local y no se muestran en esta aplicación Pro.

El QR de cada mesa usa una URL HTTPS con token opaco y un código corto. Los QR históricos `uttof://mesa/{id_mesa}` siguen siendo compatibles. El QR de reserva es independiente y solo valida la llegada; el QR físico de mesa inicia la visita. La cámara requiere HTTPS en despliegue o `localhost`/`127.0.0.1` durante el desarrollo.

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
