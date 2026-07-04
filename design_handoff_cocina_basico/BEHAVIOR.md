# Behavior Spec — Cocina Básico

> Todo es manual: sin WebSocket, sin cronómetros de urgencia. El cocinero avanza el pedido completo de columna en columna.

---

## Estados globales
| Estado | Qué muestra |
|---|---|
| Loading | Skeleton de columnas |
| Empty (columna) | "Sin pedidos" con ilustración simple |
| Error | Banner "No se pudo cargar. Reintentar" |

## Flujo de un pedido
1. El pedido llega ya en columna **"En espera"** (el pedido nació en el backend, no hay confirmación intermedia — igual que el resto de UTTOF).
2. El cocinero pulsa **"Empezar preparación"** → pasa a "En preparación" (PATCH estado completo, no por ítem).
3. Al terminar, pulsa **"Marcar terminado"** → pasa a "Terminado".
4. Pulsa **"Entregar a mesa"** → pasa a "Por pagar" (aquí el mesero toma el relevo: entrega físicamente y cobra).
5. Las columnas "Por pagar" → "Pagado" las mueve el flujo de cobro del mesero/caja, no un botón en este panel (solo lectura aquí).

## Actualización de datos
- **Polling simple**: refetch cada 15-20s (no WebSocket — eso es exclusivo del plan Premium).
- Botón de refresco manual opcional en el topbar.

## Filtros
- Tabs "Todos" + una por columna, filtran el tablero sin recargar.
- Al filtrar a una sola columna, el tablero muestra solo esa columna ancha (no 5 columnas vacías).

## Toast
- Al avanzar un pedido, toast breve confirmando ("Pedido #7 → Terminado"), auto-dismiss ~2.2s.

## Fuera de alcance (reservado para Premium)
- Cronómetro en vivo por ticket con cambio de color por urgencia.
- Marcar platillos individuales dentro de un mismo pedido.
- Sonido al llegar pedido nuevo.
- Reportar falta de insumo / pausar ticket.
- Reconexión WebSocket.
