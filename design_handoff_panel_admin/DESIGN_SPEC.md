# Design Spec — Panel Admin UTTOF

> Spec pixel-perfect para el Panel de Administración.
> Toda implementación en Tailwind debe usar **estos valores exactos**.

---

## 🎨 1. Paleta de colores

### Neutros (crema / tinta)

```ts
cream: {
  50:  '#FAF6F0',   // fondo de la app
  100: '#F4ECE0',   // superficies secundarias
  200: '#EADFCD',
  300: '#DCCDB3',
}
ink: {
  900: '#1F1A14',   // texto principal
  700: '#3A322A',   // texto secundario
  500: '#6B6056',   // texto terciario / labels
  400: '#8E8378',   // texto deshabilitado
  300: '#B3A89C',
  200: '#D4C9BC',
}
```

### Acento principal — Coral (terracotta)

```ts
terracotta: {
  50:  '#FDE8E2',
  100: '#FACFC2',
  200: '#F5A593',
  400: '#F26B53',
  500: '#E94B33',   // ⭐ COLOR PRIMARIO
  600: '#C93820',
  700: '#9C2A17',
}
```

### Acentos secundarios

```ts
sage:     { 100: '#CFEAE1', 500: '#5BB39A' }   // verde — éxito, ingresos
saffron:  { 100: '#F5E2C0', 500: '#D9A23B' }   // dorado — warnings, tickets
wine:     { 100: '#F6D4CE', 500: '#C04A3D' }   // vino — alertas críticas
sky:      { 100: '#DCE6EF', 500: '#6B8FA8' }   // azul — info, pedidos
```

### Semánticos

```ts
success: '#4F8A5B'
warning: '#C98A1A'
danger:  '#B44A3B'
```

### Superficies

```ts
bg:        cream.50
surface:   '#FFFFFF'
surface-2: cream.100
border:    'rgba(42, 30, 20, 0.08)'    // bordes sutiles
border-strong: 'rgba(42, 30, 20, 0.14)' // bordes pronunciados
```

---

## ✍️ 2. Tipografía

### Familias

| Token | Familia | Uso |
|---|---|---|
| `--font-serif` | **Fraunces** (variable, opsz 9-144) | Headings, números grandes, marca |
| `--font-sans` | **Inter** | Texto UI, labels, body |
| `--font-mono` | **JetBrains Mono** | Números tabulares (tnum), códigos |

Importar de Google Fonts:
```html
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet"/>
```

### Escala tipográfica

| Nombre | Tamaño | Peso | Uso |
|---|---|---|---|
| `display-xl` | 40-48px Fraunces 600 | Hero numbers (ingresos totales) |
| `display-lg` | 32px Fraunces 600 | Stat card values |
| `h1` | 24px Fraunces 600 | Page titles |
| `h2` | 18px Fraunces 600 | Card titles |
| `h3` | 16px Fraunces 600 | Subsection titles |
| `body` | 14px Inter 400 | Texto general |
| `body-sm` | 13px Inter 400 | Texto secundario |
| `label` | 12px Inter 500 | Labels de stat cards (uppercase, letter-spacing 0.06em) |
| `caption` | 11px Inter 400 | Pies de gráficos, metadata |
| `mono-sm` | 11px JetBrains Mono 500 | Códigos, IDs |

### Números tabulares

Para todo número que se compare (montos, contadores, porcentajes), aplicar:
```css
font-variant-numeric: tabular-nums;
```
Clase Tailwind sugerida: `tnum` (custom).

---

## 📐 3. Espaciado

Escala base: **múltiplos de 4px**.

```
1  = 4px      6 = 24px
2  = 8px      8 = 32px
3  = 12px    10 = 40px
4  = 16px    12 = 48px
5  = 20px    14 = 56px
              16 = 64px
```

Densidades disponibles (multiplica todo):
- `compact` = 0.82
- `normal` = 1.0  ⭐ default
- `cozy` = 1.15

---

## 🔵 4. Border radius

```ts
sm:   8px      // botones pequeños
md:   12px     // inputs
lg:   16px     // cards
xl:   20px     // cards grandes
full: 9999px   // pills, chips
```

---

## ☁️ 5. Sombras

```ts
sm: '0 1px 0 rgba(42,30,20,0.04), 0 1px 2px rgba(42,30,20,0.04)'
md: '0 1px 0 rgba(42,30,20,0.04), 0 8px 24px -8px rgba(42,30,20,0.12)'
lg: '0 2px 4px rgba(42,30,20,0.04), 0 24px 48px -16px rgba(42,30,20,0.18)'
```

---

## 🧩 6. Componentes principales

### 6.1 — Topbar (header global)

- Altura: **64px**
- Fondo: `surface` (blanco)
- Borde inferior: `1px solid border`
- Padding: `0 28px`
- Sticky `top: 0`, `z-index: 20`
- Contenido (gap: 20px):
  - **Brand** (32px círculo + nombre "UTTOF" en Fraunces 16px)
  - **Role pill** (pill con icono settings + "Administración", padding 4×10, bg cream-100, border-radius full)
  - Spacer flex-1
  - **Actions** (3 icon-btns + user-chip + logout-btn)
- **User chip:** avatar 32×32 redondo bg coral + nombre + rol (12px ink-500)

### 6.2 — TabNav (navegación)

- Altura: 52px
- Borde inferior: `1px solid border`
- Sticky bajo el topbar
- Tabs en línea con gap 4px
- Cada tab:
  - Padding: `10px 14px`
  - Font: 13px Inter 500
  - Icono 16px a la izquierda
  - **Count badge** (opcional): pill 11px, bg ink-100, padding 1×6
  - Estado activo: color `ink-900`, underline animada (2px coral-500) con transición sliding

Tabs (en orden): Dashboard · Menú · Mesas · Reservas · Usuarios · Reportes · Config.

### 6.3 — StatCard

- Fondo: `surface`
- Border-radius: `lg` (16px)
- Padding: `20px 24px`
- Borde: `1px solid border`
- Shadow: `sm`
- Estructura interna:
  - Head (flex space-between):
    - **Label** (12px Inter 500 ink-500 uppercase letter-spacing 0.06em)
    - **Value** (Fraunces 600, 32px, ink-900) — números con tnum
    - **Icon variant** (40×40 redondeado con bg tinted, ícono color matching)
  - Foot (flex space-between, mt: 16):
    - **Delta** (pill 11px con flecha ↑↓ + porcentaje)
    - **Sparkline** (60×24px, color matching)

**Variants del icono:**
- `green` → bg sage-100, color sage-500
- `blue` → bg sky-100, color sky-500
- `terracotta` → bg terracotta-100, color terracotta-500
- `saffron` → bg saffron-100, color saffron-500

**Variants del delta:**
- `up` → color sage-500, bg sage-100
- `down` → color wine-500, bg wine-100
- `flat` → color ink-500, bg ink-100

### 6.4 — Card (genérico)

- Fondo: `surface`
- Border-radius: `lg` (16px)
- Padding: `24px`
- Borde: `1px solid border`
- Shadow: `sm`
- Card-head con padding bottom 16px y border-bottom dashed cuando aplica

### 6.5 — Activity Feed

Cada renglón:
- Padding vertical: 12px
- Borde inferior: 1px solid border
- Estructura: avatar 32×32 (iniciales, bg tinted por tipo) + contenido + timestamp
- Tipos con color:
  - `order` → coral
  - `pay` → sage
  - `ready` → sky
  - `reserve` → saffron
  - `review` → wine

### 6.6 — Alert (alertas del sistema)

- Card con bg tinted según level
- `urgent` → bg wine-100, borde left 3px wine-500
- `warn` → bg saffron-100, borde left 3px saffron-500
- Icono 18px a la izquierda + title (14px 600) + sub (12px ink-500)

### 6.7 — Botones

**Primary** (CTA principal):
- bg `terracotta-500`, color `#FFF`
- padding `12px 20px`
- border-radius `md` (12px)
- font: 14px Inter 600
- Hover: bg `terracotta-600`, transform translateY(-1px)
- Shadow: md

**Ghost** (secundario):
- bg transparent, color `ink-900`
- border `1px solid border-strong`
- mismo padding y radius

**Icon button:**
- 36×36, border-radius `md`
- bg transparent, color `ink-500`
- Hover: bg `cream-100`, color `ink-900`

### 6.8 — Inputs

- Altura: 40px
- Padding: `0 14px`
- Border: `1px solid border-strong`
- Border-radius: `md`
- Font: 14px Inter
- Focus: border-color `terracotta-500`, ring 3px `terracotta-100`

---

## 📊 7. Charts (Recharts recomendado)

- **AreaChart** para "Ingresos últimos 14 días"
  - Series: thisWeek (coral) + lastWeek (ink-300 gris)
  - Gradient fill 30% opacity
  - Grid horizontal sutil
- **Sparkline** mini en stat cards (sin ejes, sin labels)
- **Heatmap** 7×24 para "Pedidos por hora/día"
  - Cell 32×32, border-radius sm
  - Color: interpolar `cream-100` → `terracotta-500` según valor
- **Donut** para distribución de estados de pedido
  - Stroke-width 24, sin labels (legend al lado)

---

## 📱 8. Layout del Dashboard

```
┌─────────────────────────────────────────────────┐
│  Topbar (64px sticky)                            │
├─────────────────────────────────────────────────┤
│  TabNav (52px sticky)                            │
├─────────────────────────────────────────────────┤
│                                                  │
│  Container: max-width 1440px, padding 28px      │
│                                                  │
│  [Stat] [Stat] [Stat] [Stat]    ← grid-4 gap-5  │
│                                                  │
│  ┌─────────────────────────┐  ┌──────────────┐ │
│  │  Revenue Chart           │  │  Top         │ │
│  │  (col-span-2)            │  │  Platillos   │ │
│  └─────────────────────────┘  └──────────────┘ │
│                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│  │ Distribu-│  │ Pagos    │  │  Actividad   │  │
│  │ ción     │  │ por tipo │  │  reciente    │  │
│  └──────────┘  └──────────┘  └──────────────┘  │
│                                                  │
│  ┌─────────────────────────────────────────┐    │
│  │  Heatmap pedidos por hora                │    │
│  └─────────────────────────────────────────┘    │
│                                                  │
│  ┌─────────────────────────────────────────┐    │
│  │  Alertas del sistema                     │    │
│  └─────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘
```

Grid usa CSS Grid 12 columnas con gap-5 (20px).

---

## 🌗 9. Dark mode (opcional)

Si implementas dark mode, las variables se invierten:
- `bg` = `#16110C` · `surface` = `#1F1813`
- `ink-900` = `#F4ECE0` (texto claro)
- Coral mantiene su tono base
