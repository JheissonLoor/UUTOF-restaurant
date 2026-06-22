# Behavior Spec — App Mesero

> Interacciones, estados y flujos. App táctil.

---

## 🎬 Estados globales

| Estado | Cuándo | Qué muestra |
|---|---|---|
| Loading | Cargando mesas/pedido | Skeleton de tarjetas |
| Empty | Mesero sin mesas asignadas | Ilustración + "No tienes mesas en este turno" |
| Error | Falla de red | Card con "Reintentar" |
| Realtime | Llega evento de cocina | La mesa correspondiente cambia de color + sutil pulso |

---

## 🔐 Login / sesión

- El mesero inicia sesión con `mesero@uttof.pe`. JWT en localStorage.
- La app filtra y muestra **solo las mesas asignadas a ese mesero**.

---

## 🧭 Pantalla 1 — Mesas (home)

- **Refresh automático** cada 20s + WebSocket para cambios de estado.
- Filtros (Todas/Ocupadas/Atención/Libres) filtran el grid en cliente.
- **Tap en mesa ocupada/lista** → abre Detalle. Mesa libre no abre detalle (o abre flujo "sentar comensales").
- Mesa con `alert` (badge !) = requiere atención (plato listo sin recoger, tiempo excedido). Aparece en filtro "Atención".
- Cuando cocina marca un pedido **listo**, la mesa pasa a estado `lista` (fondo sun) en vivo con un pulso.
- Botón "Nueva orden" abajo → seleccionar mesa libre → sentar comensales.

## 🪑 Sentar comensales (mesa libre)
- Tap en "Nueva orden" o mesa libre → mini-form: # comensales → marca mesa `ocupada`, crea sesión de pedido vacía, abre Detalle.

---

## 📋 Pantalla 2 — Detalle de mesa

### Order card
- Muestra total acumulado en vivo, curso actual y cuántos ítems están en cocina.

### Acciones rápidas
- **Llamar cocina**: envía nota a KDS (toast "Mensaje enviado a cocina").
- **Dividir cuenta**: abre SplitSheet.
- **Cambiar mesa**: selecciona mesa destino, migra el pedido.
- **Cuenta QR**: genera QR para que el cliente pague desde su celular (toast "Cuenta enviada al cliente").

### Lista de ítems
- Cada ítem muestra su estado (sincronizado con cocina vía WebSocket).
- Cuando un ítem pasa a `Listo en pase`, se resalta hasta que el mesero lo marca entregado.
- **Marcar entregado**: tap en el ítem listo → confirma entrega → estado `entregado` (PATCH a backend).

### Footer
- "Agregar platillo" → Pantalla 3.
- "Cobrar cuenta" → PaySheet.

---

## ➕ Pantalla 3 — Agregar platillos

- Tabs de categoría cambian la lista sin recargar.
- Tap en + agrega 1; si el platillo tiene modificadores (término, guarnición), abre **ModSheet** primero.
- Carrito flotante actualiza count y total en vivo.
- **"Enviar a cocina"**:
  - Escribe los ítems al pedido de la mesa.
  - Cada ítem nace en estado `en_cocina` (modelo postpago, sin confirmación intermedia).
  - Emite evento WebSocket → el KDS hace "ding".
  - Toast "Pedido enviado a cocina" + vuelve al Detalle.

---

## 💳 PaySheet — Cobrar (con verificación de efectivo)

1. Selector de método: Tarjeta · Efectivo · Yape/QR · Mixto.
2. Selector de propina: 10% / 15% / 20% / Otra (calcula sobre subtotal).
3. **Si método = Efectivo:**
   - Aparece bloque "¿Con cuánto paga el cliente?" con denominaciones sugeridas (Justo, y billetes de soles por encima del total).
   - Al elegir, calcula **"Cambio a entregar S/ X"**.
   - El botón dice **"Confirmar S/ X recibidos"**.
   - Este es el flujo de **verificación**: el cliente pudo elegir efectivo desde su app, y el mesero confirma la recepción física.
4. **Si método = Tarjeta/Yape:** "Confirmar pago · S/ X" (procesa al instante).
5. Al confirmar:
   - PATCH pago → pedido pasa a `pagado`, mesa a `libre`.
   - Pantalla de éxito (círculo mint + "¡Pago completado!").
   - Vuelve a la lista de mesas.

---

## ✂️ SplitSheet — Dividir cuenta

- Modos:
  - **Partes iguales**: selector de # personas → "Cada uno paga S/ X".
  - **Por platillo**: asignar ítems a cada comensal.
  - **Personalizado**: montos manuales por cuenta.
- Al confirmar, genera N sub-cuentas (cada una puede pagarse por separado).

---

## 🔄 Tiempo real (WebSocket)

El mesero **escucha** estos eventos del bus:
| Evento | Efecto en la UI |
|---|---|
| `pedido.listo` | Mesa pasa a `lista` (sun) + badge atención + sonido suave |
| `pedido.item_listo` | El ítem se resalta en el detalle |
| `pedido.pagado_app` | Si el cliente pagó desde su app, la mesa se libera sola |
| `mesa.checkin` | Una mesa libre con walk-in QR aparece como ocupada |

El mesero **emite**:
| Acción | Evento |
|---|---|
| Enviar a cocina | `pedido.creado` / `pedido.items_agregados` |
| Marcar entregado | `pedido.entregado` |
| Cobrar | `pedido.pagado` |

---

## ♿ Táctil & accesibilidad

- Targets mínimos 44×44px.
- Sheets cierran con swipe-down o tap en backdrop.
- Feedback táctil en cada acción (toast).
- Contraste AA.
