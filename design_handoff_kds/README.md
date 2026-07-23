# Design Handoff Package — KDS Cocina UTTOF · PLAN PREMIUM

> Paquete de entrega para implementar el **KDS (Kitchen Display System)** de UTTOF en React + TypeScript + Tailwind CSS.
>
> ⭐ Esta es la versión **PREMIUM** del panel de cocina (el upsell). La versión estándar es `design_handoff_cocina_basico/`. Diferencias del Premium: tema oscuro profesional, tiempo real por WebSocket, cronómetros con urgencia automática, marcado de platillos individuales, reportar falta de insumo y pausar tickets.

Pantalla para **monitor grande/tablet horizontal en cocina** — NO es una app móvil. Los cocineros ven los tickets de pedidos entrantes y marcan platillos como listos.

Preparado a partir del prototipo aprobado (`reference/kds.html`).

## 📂 Qué contiene

| Archivo | Para qué |
|---|---|
| `DESIGN_SPEC.md` | Spec pixel-perfect: colores (tema oscuro), tipografía, componentes |
| `BEHAVIOR.md` | Interacciones, estados, tiempo real, cronómetros |
| `DATA_CONTRACT.md` | Endpoints y tipos TypeScript |
| `COMPONENT_INVENTORY.md` | Componentes a construir, en orden |
| `tailwind.config.ts` | Configuración con paleta oscura del KDS |
| `reference/` | Prototipo original (kds.html + css + jsx) |

## 🎯 Contexto del rol

El KDS es la pantalla que **recibe los pedidos apenas el mesero (o el cliente desde su app) los envía a cocina**. Recuerda las decisiones de negocio ya tomadas:

- **Sin confirmación intermedia**: el pedido llega directo a `en_cocina` (no existe estado `confirmado`).
- El cocinero marca cada **ítem** individual como listo; cuando TODOS los ítems de un ticket están listos, el ticket completo pasa a `listo`.
- El mesero recibe la notificación (WebSocket) y **entrega** el plato — el KDS no marca `entregado`, eso es del mesero.
- Diseño de **alto contraste, tema oscuro**, pensado para verse bien bajo luz de cocina y a distancia.
- Tickets con **cronómetro en vivo** que cambia de color según tiempo transcurrido vs. objetivo.

## 🚀 Guía de implementación

```
Lee TODA la carpeta /design_handoff_kds/ antes de escribir código:
- README.md
- DESIGN_SPEC.md       (tema oscuro, colores, tipografía, componentes)
- BEHAVIOR.md          (cronómetros, estados, tiempo real)
- DATA_CONTRACT.md     (endpoints y tipos)
- COMPONENT_INVENTORY.md (qué construir y en qué orden)
- tailwind.config.ts   (cópialo tal cual)
- reference/           (el prototipo visual a replicar)

OBJETIVO:
Construir el KDS en /frontend/kds con React 18 + TypeScript + Vite + Tailwind.
Es una pantalla de cocina (monitor grande, tema oscuro, alto contraste,
NO diseño móvil). Conéctala al backend real (mismo del Admin y Mesero).

REGLAS:
1. Sigue DESIGN_SPEC.md al pie de la letra (tema oscuro, no inventes colores).
2. NO copies el CSS de reference/ literal — tradúcelo a Tailwind.
3. Implementa los cronómetros y estados de BEHAVIOR.md.
4. Construye los componentes de COMPONENT_INVENTORY.md EN ORDEN.
5. Después de cada componente, muéstrame screenshot y espera mi OK.
6. git commit después de cada componente terminado.

EMPIEZA POR: Fase A (shell + topbar + tickets básicos).
```
