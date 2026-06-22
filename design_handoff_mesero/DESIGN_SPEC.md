# Design Spec — App Mesero UTTOF

> Spec pixel-perfect. App móvil/tablet. Toda implementación en Tailwind usa estos valores exactos.

---

## 🎨 1. Paleta de colores

```ts
// Neutros
cream:  { bg: '#FAF6F0', bg2: '#F4ECE0', surface: '#FFFFFF' }
ink:    { 900: '#1F1A14', 700: '#3A322A', 500: '#6B6056', 400: '#9B9189' }
border: 'rgba(31,26,20,0.08)'
border2:'rgba(31,26,20,0.16)'

// Acento coral (primario)
coral:  { DEFAULT: '#E94B33', 600: '#C93820', 700: '#9C2A17', 50: '#FDE8E2', 100: '#FACFC2' }

// Secundarios
mint:   { DEFAULT: '#5BB39A', 600: '#3A8A72', 50: '#DEF1EA' }   // éxito, listo, cambio efectivo
sun:    { DEFAULT: '#E8B14A', 50: '#FBEFD1' }                    // atención, efectivo
```

### Colores por estado de mesa
| Estado | Fondo | Borde / acento | Texto |
|---|---|---|---|
| `libre` | superficie | borde sutil, atenuado | ink-400 |
| `ocupada` (activa) | `coral-50` | `coral` | ink-900 |
| `lista` (plato listo) | `sun-50` | `sun` | ink-900 |

---

## ✍️ 2. Tipografía

| Familia | Uso |
|---|---|
| **Fraunces** (serif, 500-700) | Nombres de mesa, montos grandes, títulos |
| **Inter** (400-700) | Texto UI, labels, body |
| `tnum` (`font-variant-numeric: tabular-nums`) | Todos los montos y contadores |

Import:
```html
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"/>
```

### Escala
| Nombre | Tamaño | Uso |
|---|---|---|
| stat-val | 22px Fraunces 500 | Valores del header (ventas, mesas) |
| mesa-name | 22px Fraunces 600 | "Mesa 4" en tarjetas |
| order-total | 36px Fraunces 600 | Total grande en detalle de mesa |
| h2 | 21px Fraunces 600 | Títulos de pantalla / sheets |
| body | 14px Inter 400 | Texto general |
| label | 12px Inter 600 uppercase | Etiquetas (VENTAS TURNO) |
| tag | 11px Inter 600 | Estados por ítem, badges |

> ⚠️ App móvil: targets táctiles **mínimo 44×44px**.

---

## 📐 3. Espaciado y radios

Escala base múltiplos de 4px. Radios:
```ts
sm: 10px   // chips, botones pequeños
md: 14px   // cards internas, inputs, métodos de pago
lg: 18px   // tarjetas de mesa, listas
xl: 22px   // hero/order card oscura
full: 999px // pills, badges
```

Sombras: suaves, `0 8px 24px -8px rgba(31,26,20,0.12)` para elementos elevados (carrito flotante, sheets).

---

## 🧩 4. Componentes

### 4.1 — Topbar
- Padding superior generoso (safe-area, ~60px), fondo `surface`, borde inferior.
- Fila 1: saludo ("BUENAS TARDES" label + "Diego R." en Fraunces) + pill de turno verde ("Turno · 4h 12m").
- Fila 2: **3 stat cards** en grid: Ventas turno (S/), Mesas (4/6), Comensales.
- Buscador abajo: input redondeado con ícono lupa, placeholder "Buscar mesa, orden o cuenta…".

### 4.2 — Tabs de filtro
- Scroll horizontal de pills: Todas · Ocupadas · Atención · Libres.
- Cada una con count badge.
- Activa: fondo `ink-900`, texto blanco. Inactiva: texto ink-500.

### 4.3 — MesaCard (tarjeta de mesa)
- Grid de 2 columnas, gap 12px.
- Color de fondo según estado (ver tabla colores por estado).
- Contenido:
  - Header: "Mesa N" (Fraunces 22px) + pill de estado ("Activa"/"Plato listo"/"Libre").
  - Badge **!** rojo arriba-derecha si `alert > 0`.
  - Meta: comensales (ícono + "4/4"), # platos ("9 platos").
  - Progreso: label de estado del curso ("Esperando entrada").
  - Footer: total (S/ Fraunces) + tiempo transcurrido.
- Mesa `libre`: solo muestra capacidad ("4 lugares"), no clickable para detalle.

### 4.4 — Detalle de mesa
- Header: back + "Mesa 4" + "Terraza · 4 comensales · 28 min" + menú (⋮).
- **Order card oscura** (`ink-900` gradient): "ORDEN #1042", total grande (S/ 168), curso actual, chips de meta (hora apertura, # personas, "3 en cocina").
- Fila de **acciones rápidas** (4): Llamar cocina, Dividir cuenta, Cambiar mesa, Cuenta QR. Cada una ícono en cuadro tinted + label.
- Lista "Orden actual" con header (# platos · # unidades).
- Footer fijo: 2 botones — "Agregar platillo" (ghost) + "Cobrar cuenta" (primary coral).

### 4.5 — OrderItem (renglón de pedido)
- Qty badge (×N) en cuadro coral.
- Nombre + nota en itálica gris (ej. "Término medio · 1 sin cebolla").
- Tag de estado por ítem: `Entregado` (gris), `En cocina` (coral suave), `Listo en pase` (mint).
- Precio a la derecha (S/ tnum).

### 4.6 — Agregar platillos
- Tabs de categoría (scroll horizontal): Entradas, Plato fuerte, Postres, Bebidas, Tragos.
- Lista de DishRow: imagen + nombre + desc + precio (S/) + tiempo prep + nivel de picante (íconos).
- Botón +/− de cantidad por platillo (al tocar abre ModSheet si tiene modificadores).
- **Carrito flotante** abajo: "N platos en orden" + total (S/) + botón "Enviar a cocina".

### 4.7 — Sheets (bottom sheets)
Estructura común: fondo oscurecido (`backdrop`), panel inferior con handle, título, contenido scrolleable, footer fijo.

- **SplitSheet** (Dividir cuenta): 3 modos (Partes iguales / Por platillo / Personalizado), selector de # personas, resultado "Cada uno paga S/ X".
- **PaySheet** (Cobrar): selector de método (Tarjeta/Efectivo/Yape·QR/Mixto), propina (10/15/20/Otra), resumen subtotal+propina+total.
  - **Verificación de efectivo**: cuando método = Efectivo, muestra bloque mint "¿Con cuánto paga el cliente?" con denominaciones (Justo / S/ 50 / S/ 100 / S/ 200) → calcula "Cambio a entregar S/ X". Botón cambia a "Confirmar S/ X recibidos".
- **ModSheet** (modificadores): descripción, término de cocción (Rojo/Medio/3-4/Bien cocido), acompañamiento, nota, stepper de cantidad + "Agregar · S/ X".

### 4.8 — Botones
- **primary**: bg coral, texto blanco, radius md, peso 600. Touch ≥ 48px alto.
- **ghost**: borde, texto ink, fondo transparente.
- **action-mini**: ícono en cuadro tinted (coral/mint/sun/ink) + label debajo, 12px.

### 4.9 — Toast y éxito
- Toast: pill oscuro flotante abajo con ícono check, auto-dismiss ~2.2s.
- Pantalla de éxito de pago: círculo mint con check grande + "¡Pago completado!".

---

## 📱 5. Layout general

App de **una columna**, altura completa (100vh / 100dvh), `overflow: hidden` en el shell. Tres vistas que se intercambian (mesas / detalle / agregar) + sheets superpuestos. Optimizada para sostener el dispositivo en una mano.

Pantallas con `data-screen-label`:
- "01 Mesas" · "02 Detalle" · "03 Agregar"
