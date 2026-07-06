# Behavior Spec — KDS Cocina

> Interacciones, estados y tiempo real. Pantalla de cocina, no móvil.

---

## 🎬 Estados globales

| Estado | Cuándo | Qué muestra |
|---|---|---|
| Loading | Cargando tickets iniciales | Skeleton de tarjetas |
| Empty | Sin pedidos activos | "Todo tranquilo — sin tickets pendientes" |
| Error | Falla de conexión / WebSocket caído | Banner rojo "Reconectando…" |
| Realtime | Llega ticket nuevo | Aparece con highlight + sonido "ding" |

---

## 🔌 Cómo llega un ticket nuevo (el flujo completo)

1. El cliente (desde su app) o el mesero envían el pedido → backend transiciona el pedido a `en_cocina` automáticamente (sin paso de confirmación).
2. El backend emite evento WebSocket `pedido.creado` con el ticket completo (mesa, ítems, mesero, origen).
3. El KDS escucha el evento → **inserta el ticket en estado `new`** + reproduce sonido + breve resaltado visual (borde brillante 1.5s).
4. El cronómetro del ticket arranca en `elapsed: 0`.

---

## ✅ Marcar ítems

- Tap en un renglón de ítem → toggle `done: true/false`.
- Cuando el primer ítem se marca, el ticket completo pasa de `new` a `cooking` (si no lo estaba ya).
- Cuando **todos** los ítems están `done`, el ticket pasa automáticamente a `ready` — dispara:
  - PATCH `/pedidos/{id}/estado { transicion: "marcarListo" }`.
  - Emite WebSocket `pedido.listo` → lo escucha la app del Mesero (la mesa se resalta).
  - Sonido de campana + el ticket se mueve visualmente a la sección/color "listo".
- Si se desmarca un ítem de un ticket `ready`, regresa a `cooking`.

## 🚨 Urgencia automática

- Cada segundo, si `elapsed > target * 0.95` y el ticket no está `ready`, pasa a estado visual `urgent` (aunque siga "cocinando" en el backend — es solo indicador visual de prioridad).
- Los tickets `urgent` deben ordenarse primero en la vista "Activos".

## 🍽️ Entregar (opcional desde KDS)
- Ticket `ready` con botón "Entregado" — normalmente el MESERO es quien marca esto desde su app, pero cocina puede confirmarlo si el mesero está ocupado. Al presionar:
  - PATCH transición `entregar`.
  - El ticket desaparece del board (pasa a `delivered`, se archiva).

## ⚠️ Reportar falta de insumo
- Botón "···" en cada ticket → menú con "Reportar falta de insumo".
- Abre modal simple: selecciona el ítem afectado + nota → envía notificación al mesero/admin (no bloquea el ticket, pero lo marca con un ícono de alerta).

## ⏸️ Pausar ticket
- Desde el mismo menú "···" → pausa el cronómetro de ese ticket (para casos excepcionales, ej. cliente pidió esperar). Vuelve a correr al reanudar.

---

## 🎛️ Filtros y vistas

- Tabs de filtro (Activos/Nuevos/Cocinando/Urgentes/Listos) filtran el board sin recargar.
- Toggle Tarjetas/Lista cambia la densidad visual (Lista = filas compactas para muchos tickets simultáneos).
- "Pantalla completa" usa el Fullscreen API del navegador.

---

## 🔄 WebSocket — eventos

El KDS **escucha**:
| Evento | Efecto |
|---|---|
| `pedido.creado` | Inserta ticket nuevo (estado `new`) + sonido |
| `pedido.items_agregados` | Agrega ítems a un ticket existente ya en cocina |
| `pedido.cancelado` | Remueve el ticket del board (con confirmación visual) |

El KDS **emite**:
| Acción | Evento |
|---|---|
| Todos los ítems listos | `pedido.listo` (→ lo recibe el Mesero) |
| Reportar falta de insumo | `insumo.alerta` (→ admin/mesero) |
| Marcar entregado (si aplica) | `pedido.entregado` |

---

## 🔊 Sonido y accesibilidad
- Sonido corto (no intrusivo) al llegar ticket nuevo — silenciable desde topbar.
- Alto contraste AA+ (ambiente de cocina con luces variables).
- Todo interactivo debe responder a tap directo, sin necesitar doble-click ni hover.
