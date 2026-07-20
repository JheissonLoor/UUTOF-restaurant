# Design Handoff — Admin Multi-local UTTOF · PLAN MULTI-LOCAL (Enterprise)

> Paquete de entrega para implementar el **Panel de Administración Multi-local** de UTTOF en React 18 + TypeScript + Vite + Tailwind CSS.
>
> ⭐ Es el panel **Enterprise** (S/599/mes). Extiende el Admin de Operación Pro con: **consolidado multi-sucursal**, **predicción de demanda con IA**, **inventario con alertas**, **reportes exportables (PDF/Excel)**, **API/integraciones** y **marca blanca**.

Pantalla para **desktop** (dueño/gerente de cadena). NO es móvil. Sidebar fijo + vistas conmutables.

Preparado a partir del prototipo aprobado (`reference/admin.html`).

## 📂 Qué contiene

| Archivo | Para qué |
|---|---|
| `DESIGN_SPEC.md` | Spec: colores, tipografía, sidebar, cards, tablas, KPIs |
| `BEHAVIOR.md` | Navegación entre vistas, selector de sucursal, exports, toggles |
| `DATA_CONTRACT.md` | Endpoints y tipos TypeScript (consolidado, IA, inventario) |
| `COMPONENT_INVENTORY.md` | Componentes a construir, en orden |
| `tailwind.config.ts` | Paleta clara "cálida" UTTOF |
| `reference/` | Prototipo original (admin.html) |

## 🎯 Contexto del rol

El Admin Multi-local es el **cerebro de la cadena**. El dueño ve todas sus sucursales en un panel, compara rendimiento, recibe recomendaciones de IA y gestiona inventario/menú/empleados por local.

- **Ámbito multi-tenant por sucursal**: casi toda vista tiene un **selector de sucursal** (`Toda la red` / sucursal específica). El backend filtra por `id_sucursal`.
- **Consolidado** = suma/promedio de todas las sucursales activas.
- **IA de demanda**: modelo que se recalcula cada noche; muestra pronóstico + acciones recomendadas (comprar insumo, reforzar staff, ajustar menú).
- **Inventario**: stock por sucursal con alertas automáticas (crítico / bajo / ok) y cantidad sugerida de compra.
- **Reportes exportables**: PDF y Excel (a diferencia de Pro, que es solo en pantalla).
- **Integraciones (API abierta)** y **marca blanca** son exclusivas de este plan.

## 🚀 Prompt para Claude Code / Codex

```
Lee TODA la carpeta /design_handoff_admin_multilocal/ antes de escribir código:
- README.md, DESIGN_SPEC.md, BEHAVIOR.md, DATA_CONTRACT.md,
  COMPONENT_INVENTORY.md, tailwind.config.ts, reference/

OBJETIVO:
Construir el Admin Multi-local en /frontend/admin-multilocal con
React 18 + TypeScript + Vite + Tailwind. Desktop. Conéctalo al backend real
(el MISMO backend del Estándar/Pro; este plan solo añade endpoints y el
filtro id_sucursal). Reutiliza auth JWT/RBAC existente (rol: dueño/admin).

REGLAS:
1. Sigue DESIGN_SPEC.md al pie de la letra. No inventes colores.
2. NO copies el CSS de reference/ literal — tradúcelo a Tailwind.
3. Toda vista con datos por local respeta el selector de sucursal global.
4. Construye los componentes de COMPONENT_INVENTORY.md EN ORDEN.
5. Después de cada componente, muéstrame screenshot y espera mi OK.
6. git commit después de cada componente terminado.

EMPIEZA POR: Fase A (shell + sidebar + vista Consolidado).
```
