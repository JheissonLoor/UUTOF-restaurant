# Design Spec — Cocina Kanban UTTOF · Plan Operación Pro

> Topbar oscuro profesional + tablero kanban claro. Pantalla de tablet/monitor de cocina o laptop en el mostrador. Sincroniza cada 15s (polling), NO tiempo real por WebSocket (eso es el KDS de Multi-local).

---

## 🎨 1. Paleta de colores

```ts
cream:  { bg: '#FAF6F0', bg2: '#F4ECE0', surface: '#FFFFFF' }
ink:    { 900: '#1F1A14', 700: '#3A322A', 500: '#6B6056', 400: '#9B9189' }
border: 'rgba(31,26,20,0.08)'
border2:'rgba(31,26,20,0.15)'

coral:  { DEFAULT: '#E94B33', 600: '#C93820', 50: '#FDE8E2', 100: '#FACFC2' }
mint:   { DEFAULT: '#5BB39A', 600: '#3A8A72', 50: '#DEF1EA' }
sun:    { DEFAULT: '#E8B14A', 600: '#B07E1E', 50: '#FBEFD1' }
sky:    { DEFAULT: '#6B8FA8', 600: '#4A6F88', 50: '#E8EFF5' }
plum:   { DEFAULT: '#8C6BA1', 50: '#EFE9F4' }
```

### Colores por columna (estado del pedido)
| Columna | Acento (punto + badge) |
|---|---|
| En espera | sun |
| En preparación | coral |
| Terminado | mint |
| Por pagar | sky |
| Pagado | plum |

---

## ✍️ 2. Tipografía
- **Fraunces** (500–700): marca, títulos de página, número de pedido (#7), totales.
- **Inter** (400–700): todo el UI.
- **JetBrains Mono**: reloj, contadores, tiempos transcurridos (`tnum`).

---

## 🧩 3. Componentes

### 3.1 Topbar (OSCURO — `linear-gradient(100deg,#1B1610,#231C15)`, alto 70px, texto crema #F4ECE0)
- Marca UTTOF (ícono coral + nombre) + badge dorado **"PLAN PRO"** (`linear-gradient(135deg,#E8B14A,#B07E1E)`, texto #221A08).
- **3 stat pills en vivo**: Preparando (punto coral), En espera (punto sun), Listos (punto mint) — cada uno con valor grande (Fraunces 19px) + label pequeño. Fondo `rgba(255,255,255,0.05)`.
- A la derecha: indicador **"Sincroniza c/15s"** (mono, verde menta, punto que pulsa) + reloj en vivo (es-PE) + avatar/nombre del cocinero de turno.

### 3.2 Encabezado de página
- Título "Panel de Cocina" + subtítulo con conteo de activos y listos.
- Selector de filtro por mesa (placeholder simple, "Todas las mesas").

### 3.3 Tabs de filtro
- "Todos" + una tab por columna, cada una con contador. Activa = fondo **ink sólido** (#1F1A14) con texto crema.

### 3.4 Tablero (5 columnas)
- Grid `repeat(5, 1fr)`, gap 15px. Columnas SIN contenedor de fondo: solo header (punto de color + label + contador) sobre el fondo de página.
- Columna vacía: borde punteado + ilustración simple + "Sin pedidos".

### 3.5 Tarjeta de pedido
- **Franja de color lateral** (4px) según estado; roja si urgente.
- Header: `#folio` (Fraunces) + **ícono de origen** (⚡ coral = pedido desde app cliente · ● azul = tomado por mesero) + badge de estado a la derecha.
- Meta en una fila: nombre del cliente + mesa.
- **Barra de progreso** (solo en espera/preparación): track gris + relleno menta `listos/total` ítems, con etiqueta `N/total` en mono.
- Lista de platillos: cantidad + nombre + nota de alergia en itálica coral si existe. Ítems ya listos van tachados en gris.
- Footer: tiempo transcurrido (mono; rojo `#B44A3B` + "sobre tiempo" si > 20 min y activo) + total en soles.
- Botón de acción **sólido a todo el ancho** (coral / menta / azul según destino): avanza el pedido a la siguiente columna. "Por pagar" y "Pagado" no tienen botón (esas transiciones las hace el mesero/caja).

---

## 📐 4. Layout
Una sola página, sin scroll global — el tablero puede scrollear horizontalmente en pantallas angostas. Grid responsivo: en pantallas < 1200px, colapsar a 2-3 columnas visibles con scroll horizontal del board completo.
