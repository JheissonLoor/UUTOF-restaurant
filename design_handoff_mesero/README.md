# Design Handoff Package — App Mesero UTTOF

> Paquete profesional de entrega para implementar la **App del Mesero** de UTTOF en React + TypeScript + Tailwind CSS.

App **móvil/tablet** para que el mesero gestione sus mesas, tome órdenes, las envíe a cocina y cobre (incluyendo verificación de efectivo del modelo postpago).

Preparado a partir del prototipo aprobado (`reference/mesero.html`).

## 📂 Qué contiene

| Archivo | Para qué |
|---|---|
| `DESIGN_SPEC.md` | Spec pixel-perfect: colores, tipografía, espaciados, componentes |
| `BEHAVIOR.md` | Interacciones, estados, sheets, animaciones |
| `DATA_CONTRACT.md` | Endpoints que consume y tipos TypeScript |
| `COMPONENT_INVENTORY.md` | Lista de componentes a construir, en orden |
| `tailwind.config.ts` | Configuración Tailwind con la paleta lista |
| `reference/` | Prototipo original (mesero.html + css + jsx + data) |

## 🎯 Contexto del rol

El mesero es **el puente entre la mesa física y la cocina**. Recuerda las decisiones de negocio ya tomadas:

- **Postpago**: el cliente paga después de comer.
- **Doble canal de orden**: tanto el cliente (desde su app) como el mesero (desde esta tablet) escriben al **mismo pedido** de la mesa.
- El **mesero marca `entregado`** cuando sirve el plato.
- El **mesero verifica el efectivo** cuando el cliente eligió pagar en efectivo (pantalla de cambio).
- Métodos de pago: **tarjeta, yape, efectivo, mixto** (NO SPEI). Moneda: **soles peruanos (S/)**.

## 🚀 Prompt para Claude Code

```
Lee toda la carpeta /design_handoff_mesero/ antes de empezar.

OBJETIVO:
Construir la app del Mesero en /frontend/mesero con:
- React 18 + TypeScript + Vite
- Tailwind CSS (usa el tailwind.config.ts provisto)
- Pensada para tablet/teléfono (touch, targets ≥ 44px)
- Conectada al backend real (endpoints en DATA_CONTRACT.md)

REGLAS:
1. Sigue DESIGN_SPEC.md al pie de la letra.
2. NO copies el css de reference/ literal — tradúcelo a Tailwind.
3. Implementa los estados y sheets de BEHAVIOR.md.
4. Moneda en soles (S/), formato es-PE.
5. Construye los componentes de COMPONENT_INVENTORY.md en orden,
   screenshot tras cada uno y espera mi OK.

EMPIEZA POR: Fase A (shell + lista de mesas).
```
