# Design Handoff Package — Cocina Kanban UTTOF · PLAN OPERACIÓN PRO

> Versión **kanban Pro** del panel de cocina (plan Operación Pro). Topbar oscuro profesional con stats en vivo, tarjetas con franja de color, barra de progreso por ítems, origen del pedido (app/mesero) e indicador de urgencia. Sincroniza cada 15s (polling), sin tiempo real por WebSocket.
> El **KDS oscuro en tiempo real** (WebSocket, cronómetros, marcado por platillo) está en `/design_handoff_kds/` — es el upsell de Multi-local, un módulo separado.

Preparado a partir del prototipo aprobado (`reference/cocina-pro.html`).

## 📂 Qué contiene

| Archivo | Para qué |
|---|---|
| `DESIGN_SPEC.md` | Spec pixel-perfect: colores, tipografía, componentes |
| `BEHAVIOR.md` | Interacciones y estados (todo es manual, sin realtime) |
| `DATA_CONTRACT.md` | Endpoints y tipos TypeScript |
| `COMPONENT_INVENTORY.md` | Componentes a construir, en orden |
| `tailwind.config.ts` | Configuración con la paleta clara de UTTOF |
| `reference/` | Prototipo original (cocina-basico.html) |

## 🎯 Contexto del producto

Esta es la cocina del plan **Operación Pro**: una app dedicada, más pulida que la cocina simple del plan Estándar (que va dentro de la web todo-en-uno de Lovable), pero por debajo del KDS en tiempo real de Multi-local.

| | Kanban Pro (este paquete) | KDS Multi-local (`/design_handoff_kds/`) |
|---|---|---|
| Vista | Tablero kanban, 5 columnas, topbar oscuro | Tickets con cronómetro individual, pantalla oscura completa |
| Actualización | Polling cada 15s | Tiempo real (WebSocket) |
| Granularidad | Se avanza el pedido completo (con barra de progreso por ítems) | Se marca cada platillo por separado |
| Urgencia | Aviso visual si > 20 min | Cronómetro automático que se pone rojo al exceder el objetivo |
| Extras | Origen del pedido (app/mesero) | Aviso sonoro, reportar falta de insumo, pausar tickets |

No mezclar componentes de ambos paquetes — son dos productos distintos que comparten el mismo backend de pedidos.

## 🚀 Guía de implementación

```
Lee TODA la carpeta /design_handoff_cocina_pro/ antes de escribir código:
README.md, DESIGN_SPEC.md, BEHAVIOR.md, DATA_CONTRACT.md,
COMPONENT_INVENTORY.md, tailwind.config.ts y reference/.

OBJETIVO:
Construir el Panel de Cocina — plan OPERACIÓN PRO — en /frontend/cocina
con React 18 + TypeScript + Vite + Tailwind CSS.
Es un tablero kanban con TOPBAR OSCURO + tablero claro, sincronía por polling
cada 15s (NO WebSocket). Conéctalo al backend real que ya existe
(mismo del Admin y Mesero, puerto 8000).

REGLAS:
1. Sigue DESIGN_SPEC.md al pie de la letra: topbar oscuro con stat pills en vivo,
   tarjetas con franja de color, barra de progreso por ítems, ícono de origen
   (app/mesero) y aviso de urgencia > 20 min.
2. NO copies el CSS de reference/ literal — tradúcelo a clases Tailwind.
3. Implementa los estados y transiciones de BEHAVIOR.md (polling cada 15s, sin WebSocket).
4. Construye los componentes de COMPONENT_INVENTORY.md EN ORDEN.
5. Después de cada componente corre "npm run dev", muéstrame cómo lo pruebo
   y espera mi OK.
6. git commit después de cada componente terminado.

EMPIEZA POR: Fase A (topbar oscuro con stats + tablero con datos de ejemplo).
```
