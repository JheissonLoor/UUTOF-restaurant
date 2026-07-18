# Behavior Spec — Cocina Kanban Pro

> Sincroniza por polling cada 15s (sin WebSocket). El cocinero avanza el pedido completo de columna en columna; la tarjeta muestra progreso por ítems, origen del pedido y aviso de urgencia.

---

## Estados globales
| Estado | Qué muestra |
|---|---|
| Loading | Skeleton de columnas |
| Empty (columna) | "Sin pedidos" con borde punteado + ilustración simple |
| Error | Banner "No se pudo cargar. Reintentar" |

## Flujo de un pedido
1. El pedido llega ya en columna **"En espera"** (nació en el backend, sin confirmación intermedia — igual que el resto de UTTOF).
2. El cocinero pulsa **"Empezar preparación"** → pasa a "En preparación" (PATCH del estado completo).
3. Al terminar, pulsa **"Marcar terminado"** → pasa a "Terminado" (marca listos = total de ítems).
4. Pulsa **"Entregar a mesa"** → pasa a "Por pagar" (el mesero toma el relevo: entrega y cobra).
5. "Por pagar" → "Pagado" lo mueve el flujo de cobro del mesero/caja, no un botón en este panel (solo lectura aquí).

## Progreso por ítems
- Las tarjetas en "En espera" / "En preparación" muestran una **barra de progreso** `listos/total`.
- Es informativa a nivel de tarjeta (no se marca ítem por ítem — eso es exclusivo del KDS de Multi-local). Al pasar a "Terminado" el progreso se completa al 100%.

## Origen del pedido
- Ícono en cada tarjeta: **⚡ (coral)** si el pedido entró desde la app del cliente, **● plato (azul)** si lo tomó el mesero. Es solo indicador visual.

## Urgencia
- Si un pedido activo (espera/preparación) lleva **> 20 min**, la tarjeta pasa a estado visual urgente: franja lateral roja y tiempo en rojo con "· sobre tiempo".
- Es un umbral fijo por CSS/JS en el front (no un cronómetro configurable como el KDS Premium).

## Actualización de datos
- **Polling**: refetch cada 15s (`useQuery` `refetchInterval`). No WebSocket.
- Indicador "Sincroniza c/15s" en el topbar con punto que pulsa.
- Botón de refresco manual opcional.

## Filtros
- Tabs "Todos" + una por columna, filtran el tablero sin recargar.
- Al filtrar a una sola columna, se muestra esa columna ancha (no 5 vacías).

## Toast
- Al avanzar un pedido, toast breve ("Pedido #7 → Terminado"), auto-dismiss ~2.2s.

## Fuera de alcance (reservado para el KDS de Multi-local)
- Cronómetro en vivo configurable por ticket con objetivo por platillo.
- Marcar platillos individuales dentro de un mismo pedido.
- Sonido al llegar pedido nuevo.
- Reportar falta de insumo / pausar ticket.
- Tiempo real por WebSocket / reconexión.
