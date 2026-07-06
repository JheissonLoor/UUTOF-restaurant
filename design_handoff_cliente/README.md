# Design Handoff Package — App Cliente UTTOF

> Paquete de entrega para implementar la **App del Cliente** (comensal) de UTTOF en React + TypeScript + Tailwind CSS.

App **móvil** (web app / PWA) para el comensal: escanear la mesa, explorar la carta, pedir, seguir su pedido en vivo y pagar. Es la app **más completa** del sistema.

Preparado a partir del prototipo aprobado (`reference/cliente.html` + `reference/checkin.jsx` + `reference/cuenta.jsx`).

## 📂 Qué contiene

| Archivo | Para qué |
|---|---|
| `DESIGN_SPEC.md` | Spec pixel-perfect: colores, tipografía, las 8 pantallas |
| `BEHAVIOR.md` | Flujos, navegación, tracking en vivo, checkout postpago |
| `DATA_CONTRACT.md` | Endpoints y tipos TypeScript |
| `COMPONENT_INVENTORY.md` | Componentes a construir, en orden |
| `tailwind.config.ts` | Configuración con la paleta clara de UTTOF |
| `reference/` | Prototipo original completo |

## 🎯 Contexto del rol

El cliente es **el comensal**. Recuerda las decisiones de negocio ya tomadas:

- **Entrada walk-in**: la app abre pidiendo **escanear el QR de la mesa** (`POST /mesas/:id/checkin`). También puede ingresar el número manualmente.
- **Doble canal de pedido**: el cliente pide desde su app; esos ítems van **directo a cocina** (sin confirmación) al mismo pedido de la mesa que también puede tocar el mesero.
- **Postpago**: el cliente come primero y paga al final. Al pedir la cuenta elige pagar él mismo (tarjeta/Yape) o que el mesero cobre (efectivo, que el mesero verifica).
- **Tracking en vivo**: tras enviar el pedido, ve las etapas (recibido → preparando → listo → servido) por WebSocket.
- Métodos de pago: **tarjeta, Yape/QR, efectivo, mixto** (NO SPEI). Moneda: **soles (S/)**.

## 🚀 Prompt de implementacion

```
Vamos a construir la App del Cliente (comensal) de UTTOF — la app más
completa del sistema.

Lee TODA la carpeta /design_handoff_cliente/ antes de escribir código:
README.md, DESIGN_SPEC.md, BEHAVIOR.md, DATA_CONTRACT.md,
COMPONENT_INVENTORY.md, tailwind.config.ts y reference/.

OBJETIVO:
Construir la app en /frontend/cliente con React 18 + TypeScript + Vite +
Tailwind CSS. Es una app MÓVIL (web/PWA) para el comensal.
Conéctala al backend real que ya existe (mismo del Admin y Mesero, puerto 8000).

REGLAS:
1. Sigue DESIGN_SPEC.md al pie de la letra (tema claro, paleta UTTOF).
2. NO copies el CSS de reference/ literal — tradúcelo a clases Tailwind.
3. Implementa los flujos de BEHAVIOR.md: entrada walk-in (escanear QR),
   pedido directo a cocina, tracking en vivo, checkout POSTPAGO.
4. Construye los componentes de COMPONENT_INVENTORY.md EN ORDEN (Fase A → F).
5. Después de cada componente corre "npm run dev", muéstrame cómo lo pruebo
   y espera mi OK.
6. git commit después de cada componente terminado.

EMPIEZA POR: Fase A (shell + entrada walk-in: escanear QR + confirmación).
```
