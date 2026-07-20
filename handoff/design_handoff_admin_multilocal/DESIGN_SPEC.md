# DESIGN_SPEC — Admin Multi-local UTTOF

> Fuente de verdad visual. Traducir a Tailwind (ver `tailwind.config.ts`). NO copiar el CSS del prototipo literal.

## 1. Paleta (tema claro cálido)

| Token | Hex | Uso |
|---|---|---|
| `bg` | `#FAF6F0` | Fondo de la app |
| `bg2` | `#F4ECE0` | Fondos sutiles, selector de sucursal |
| `surface` | `#FFFFFF` | Cards, tablas, modales |
| `ink` | `#1F1A14` | Texto principal, botón primario |
| `ink2` | `#3A322A` | Texto secundario |
| `ink3` | `#6B6056` | Subtítulos, labels |
| `ink4` | `#9B9189` | Texto terciario, placeholders |
| `border` | `rgba(31,26,20,0.08)` | Bordes de card |
| `border2` | `rgba(31,26,20,0.15)` | Bordes de botón/input |
| `coral / coral2` | `#E94B33 / #C93820` | Acento primario, enlaces |
| `mint / mint2` | `#5BB39A / #3A8A72` | Positivo, stock ok, toggles on |
| `sun / sun2` | `#E8B14A / #B07E1E` | Plan Enterprise, ★ features premium |
| `plum / plum2` | `#8C6BA1 / #6E4F84` | Badges IA, acentos |
| `sky / sky2` | `#6B8FA8 / #4A6F88` | Sucursal San Isidro, datos |
| `danger / danger50` | `#B44A3B / #F6DDD9` | Stock crítico, alertas |

Cada sucursal tiene color fijo: **Miraflores = coral**, **Barranco = mint2**, **San Isidro = sky2**. Úsalo en flags, pills y gráficas.

## 2. Tipografía

- **Fraunces** (serif) — títulos `h1` (32px/600), nombres de KPI grandes, números destacados.
- **Inter** (sans) — UI, tablas, labels.
- **JetBrains Mono** — cifras tabulares (`font-variant-numeric: tabular-nums`), badges, kickers.

Escala: h1 32px · h3 (card) 15px · body 13px · label 10.5px mono uppercase letter-spacing 0.12em.

## 3. Layout

```
┌──────────┬─────────────────────────────────────┐
│ Sidebar  │  Main (padding 30px 36px 40px)       │
│ 248px    │  ┌ Top: h1 + sub  ·  actions ─────┐  │
│ fijo     │  │ (selector sucursal + exports)  │  │
│ oscuro   │  └────────────────────────────────┘  │
│ sticky   │   KPIs / cards / tablas por vista     │
└──────────┴─────────────────────────────────────┘
```

- **Sidebar** `248px`, gradiente oscuro `#17130E→#201A13`, texto `#F4ECE0`. Sticky, `height:100vh`.
  - Logo: dot coral 34px + "UTTOF" (Fraunces 20px) + pill dorado "MULTI-LOCAL" (mono 9px, gradiente sun).
  - Nav items: 10px 12px, radio 11px. Activo = `rgba(233,75,51,0.16)` fondo + texto blanco. Ítems premium llevan `★` dorado. Sucursales lleva badge `3` plum.
  - Grupo "Por sucursal" con label mono uppercase.
  - Footer: avatar plum + "Ricardo Mendoza / Dueño · 3 sucursales".
- **Main**: fondo `bg`. Solo una `.view` visible a la vez (`display:block` / `none`, fade 0.22s).

## 4. Componentes clave

### Selector de sucursal (`.branch-sel`)
Segmented control: fondo `bg2`, radio 12px, padding 4px. Botones `Toda la red|Todas` + una por sucursal. Activo = fondo blanco + sombra sutil + texto ink. Aparece en el `top .actions` de IA, Inventario, Reportes, Menú, Empleados.

### KPI cards (consolidado)
Grid de 4. Card blanca, borde `border`, radio 16px. Label mono uppercase ink3 + número Fraunces ~28px + delta (verde mint2 / rojo danger con flecha).

### Tabla rendimiento (`.br-tbl`)
Filas por sucursal con flag de color (cuadrito con inicial) + nombre + dirección. Columnas numéricas alineadas a la derecha, mono. Fila total "Red completa" (Σ) resaltada. Filas `rowlink` navegan a `sucursales`.

### Branch cards (vista Sucursales)
Card por local: header (flag + nombre + dirección), 3-4 mini-stats (ingresos, pedidos, ocupación), footer con chip de estado de inventario (crit/warn) + enlace "Administrar →".

### IA / Predicción
Banda superior con pronóstico + nivel de confianza (%). Card "Acciones recomendadas": filas con ícono categorizado (comprar=coral, staff=sky, menú=plum) + texto + impacto estimado. Selector de sucursal arriba.

### Inventario
Banda de alerta (danger50) con conteo de críticos. Tabla: insumo + sucursal (pill de color) + mini-barra de nivel (color por estado) + stock + estado (chip) + cantidad sugerida. Botón "Generar orden de compra".

### Reportes
Cards de reporte con botones **Exportar PDF** y **Exportar Excel** (badges de formato). Rango de fechas + selector de sucursal.

### Configuración (incluye funciones exclusivas Enterprise)
Sub-tabs: **General**, **Integraciones (API)**, **Marca blanca**, **Facturación**.
- **Integraciones/API**: lista de conectores (contabilidad, delivery, facturación electrónica SUNAT) con toggle on/off + campo de API key + estado de conexión. Sección "API keys" para desarrolladores (generar/revocar token).
- **Marca blanca**: subir logo, elegir color primario (swatches curados de la paleta), preview en vivo del look aplicado a las apps del cliente/mesero.

### Toggle
Pista 40×22, knob 18px. On = fondo mint2, knob a la derecha.

## 5. Reglas
- Números siempre mono + tabular-nums. Moneda: `S/ 1,234` (coma de miles).
- Sombras suaves y cálidas, nunca azuladas. Radios 11–16px.
- `text-wrap: pretty` en textos largos. Zona horaria America/Lima, es-PE.
