# Behavior Spec — App Cliente

> Flujos completos. App móvil, postpago, con tracking en vivo.

---

## 🎬 Estados globales
| Estado | Qué muestra |
|---|---|
| Loading | Skeleton de cards |
| Empty | "Aún no tienes pedidos" / "Carrito vacío" |
| Error | Toast + reintentar |
| Realtime | El tracker avanza de etapa por WebSocket |

---

## 🚪 Entrada: walk-in con QR (lo primero que ve el cliente)

1. La app abre en la pantalla **Escanear QR** (no en el home).
2. El cliente escanea el código de su mesa → `POST /mesas/:id/checkin` → recibe id_mesa, zona, capacidad.
   - Alternativa: "Ingresar número de mesa" manual.
3. Muestra **confirmación "Estás en la Mesa 5"** con los pasos del flujo.
4. "Ver la carta" → entra a la app normal (tab Menú) con la sesión de mesa activa.

> La sesión de mesa se guarda en estado (y localStorage) — todos los pedidos van a esa mesa.

---

## 🍽️ Pedir (directo a cocina)

1. Cliente arma el carrito desde el Menú (+/−, favoritos).
2. Abre el carrito (drawer) → revisa → **"Enviar a cocina"**.
3. `POST /pedidos` (o `POST /pedidos/:id/items` si ya hay pedido abierto en la mesa).
   - Los ítems nacen en estado `en_cocina` (sin confirmación intermedia).
   - Se emite WebSocket → el KDS hace "ding".
4. **NO se cobra aquí** (postpago). Se abre el **Tracking en vivo**.

---

## 📡 Tracking en vivo

- 4 etapas: recibido → preparando → listo → servido.
- Avanza por eventos WebSocket (`pedido.item_listo`, `pedido.listo`, `pedido.entregado`).
- Muestra cronómetro, mesero asignado, resumen del pedido.
- Cuando llega a **servido**, aparece CTA **"Pedir la cuenta"**.

---

## 💳 Checkout / Cuenta (POSTPAGO)

1. Se abre al pulsar "Pedir la cuenta" (no antes).
2. Paso **revisar**: ítems + subtotal + propina sugerida (10/15/20/otra).
3. Paso **pagar** — elige método:
   - **Tarjeta**: formulario, procesa al instante → pedido `pagado`.
   - **Yape / QR**: muestra QR, cliente paga desde su app bancaria → confirma.
   - **Efectivo**: muestra "Pagar al mesero" → el pedido queda pendiente y **el mesero verifica la recepción** desde su app (pantalla de cambio). Recién ahí pasa a `pagado`.
   - **Mixto**: combinar 2+ métodos.
4. Paso **éxito**: recibo digital con folio, método, total, mesa. Opción de dejar reseña.

---

## 📅 Reservar (flujo alterno, sin estar en mesa)

- El cliente puede reservar antes de llegar (no requiere check-in).
- Fecha + hora + # personas + mesa del plano → `POST /reservas`.
- Valida disponibilidad; horas ocupadas se muestran deshabilitadas.

---

## 🧭 Navegación
- Tab bar inferior siempre visible (excepto en escaneo/confirmación/modales).
- Carrito, checkout y tracker son overlays — no cambian el tab activo.
- Badge del carrito refleja # de ítems en vivo.

---

## 🔄 WebSocket
El cliente **escucha**:
| Evento | Efecto |
|---|---|
| `pedido.item_listo` | El tracker resalta ese ítem |
| `pedido.listo` | Tracker avanza a "listo" |
| `pedido.entregado` | Tracker a "servido" + aparece "Pedir la cuenta" |
| `pago.verificado` | Si pagó efectivo, confirma el pago tras la verificación del mesero |

---

## ♿ Accesibilidad
- Targets ≥ 44px, contraste AA.
- Persistir carrito y sesión de mesa en localStorage (sobrevive refresh).
