# Design Handoff Package — Panel Admin UTTOF

> Paquete profesional de entrega para implementar el **Panel de Administración** de UTTOF en React + TypeScript + Tailwind CSS.

Este paquete fue preparado a partir del prototipo HTML aprobado (`reference/panel-admin.html`).

---

## 🎯 Para qué sirve este paquete

Cuando se construya el Panel Admin, este paquete evita improvisar colores y espaciados porque define **exactamente la spec aprobada**.

## 📂 Qué contiene

| Archivo | Para qué |
|---|---|
| `DESIGN_SPEC.md` | Spec pixel-perfect: colores, tipografía, espaciados, componentes |
| `BEHAVIOR.md` | Interacciones, estados, animaciones |
| `DATA_CONTRACT.md` | Endpoints que el frontend espera y tipos TypeScript |
| `COMPONENT_INVENTORY.md` | Lista exhaustiva de componentes a construir |
| `tailwind.config.ts` | Configuración Tailwind con la paleta lista |
| `reference/panel-admin.html` | Diseño original aprobado |
| `reference/styles.css` | CSS de referencia (NO copiar literal — usar Tailwind) |

---

## 🚀 Cómo usar este paquete (guía de implementación)

```
Lee toda la carpeta /design_handoff_panel_admin/ antes de empezar.

OBJETIVO:
Construir el frontend del Panel Admin en /frontend/admin con:
- React 18 + TypeScript
- Vite
- Tailwind CSS (usa /design_handoff_panel_admin/tailwind.config.ts)
- React Router para navegación entre tabs
- @tanstack/react-query para data fetching
- Axios con interceptor JWT

REGLAS ESTRICTAS:
1. Sigue DESIGN_SPEC.md al pie de la letra — colores hex, tamaños y
   espaciados exactos.
2. NO uses styles.css de reference/ literal — está como guía visual.
   Tradúcelo a clases Tailwind.
3. Implementa los estados descritos en BEHAVIOR.md (loading, empty, error).
4. Conecta a los endpoints listados en DATA_CONTRACT.md.
5. Construye los componentes listados en COMPONENT_INVENTORY.md uno
   por uno y muéstrame screenshot después de cada uno.

EMPIEZA POR: Login → Layout (Topbar + Tabs) → Dashboard.
Pregúntame antes de avanzar entre fases.
```
