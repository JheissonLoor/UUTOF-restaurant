# Design Handoff Package — Cocina Básico UTTOF

> Versión **Básica** del panel de cocina (plan estándar del producto). Tablero kanban simple, tema claro, sin tiempo real ni cronómetros — pensado como oferta de entrada.
> La versión **Premium** (KDS oscuro, WebSocket, cronómetros) está en `/design_handoff_kds/` — es un módulo separado, upsell del mismo producto.

Preparado a partir del prototipo aprobado (`reference/cocina-basico.html`).

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

Esta es la versión que se ofrece **por defecto** a cualquier restaurante que contrata UTTOF. Es simple e intencionalmente limitada frente al KDS Premium:

| | Básico (este paquete) | Premium (`/design_handoff_kds/`) |
|---|---|---|
| Vista | Tablero kanban, 5 columnas | Tickets con cronómetro individual |
| Actualización | Manual (refresh / polling) | Tiempo real (WebSocket) |
| Granularidad | Se avanza el pedido completo | Se marca cada platillo por separado |
| Urgencia | No hay indicador automático | Cronómetro que se pone rojo si se excede el tiempo |
| Tema visual | Claro, marca UTTOF | Oscuro, alto contraste, pantalla de cocina |

No mezclar componentes de ambos paquetes — son dos productos distintos que comparten el mismo backend de pedidos.

## 🚀 Prompt de implementacion

```
Lee TODA la carpeta /design_handoff_cocina_basico/ antes de escribir código:
README.md, DESIGN_SPEC.md, BEHAVIOR.md, DATA_CONTRACT.md,
COMPONENT_INVENTORY.md, tailwind.config.ts y reference/.

OBJETIVO:
Construir el Panel de Cocina — plan BÁSICO — en /frontend/cocina-basico
con React 18 + TypeScript + Vite + Tailwind CSS.
Es un tablero kanban simple, TEMA CLARO, sin tiempo real (polling normal),
para restaurantes que contratan el plan estándar de UTTOF.
Conéctalo al backend real que ya existe (mismo del Admin y Mesero, puerto 8000).

REGLAS:
1. Sigue DESIGN_SPEC.md al pie de la letra (tema CLARO, no el oscuro del KDS premium).
2. NO copies el CSS de reference/ literal — tradúcelo a clases Tailwind.
3. Implementa los estados y transiciones de BEHAVIOR.md (todo manual, sin WebSocket).
4. Construye los componentes de COMPONENT_INVENTORY.md EN ORDEN.
5. Después de cada componente corre "npm run dev", muéstrame cómo lo pruebo
   y espera mi OK.
6. git commit después de cada componente terminado.

EMPIEZA POR: Fase A (shell + topbar + tablero con datos de ejemplo).
```
