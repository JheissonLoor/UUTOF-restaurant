# Design Spec — Cocina Básico UTTOF

> Tema claro, marca UTTOF. Tablero kanban simple, pantalla de tablet/monitor de cocina o incluso un laptop en el mostrador.

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

### 3.1 Topbar
- Marca UTTOF (ícono + nombre) + pill "Panel de Cocina" + tag de versión ("Plan Básico").
- Reloj en vivo (es-PE) + avatar/nombre del cocinero de turno.

### 3.2 Encabezado de página
- Título "Panel de Cocina" + subtítulo con conteo de activos y listos.
- Selector de filtro por mesa (placeholder simple, "Todas las mesas").

### 3.3 Tabs de filtro
- "Todos" + una tab por columna, cada una con contador. Activa = fondo coral sólido.

### 3.4 Tablero (5 columnas)
- Grid `repeat(5, 1fr)`, cada columna es una tarjeta contenedora con header (punto de color + label + contador) y body scrolleable.
- Columna vacía: ilustración simple + "Sin pedidos".

### 3.5 Tarjeta de pedido
- Header: `#folio` (Fraunces) + badge de estado a la derecha.
- Meta: nombre del cliente, mesa.
- Lista de platillos: cantidad + nombre + nota de alergia en itálica coral si existe.
- Footer: tiempo transcurrido (mono, se pone coral si > 20 min) + total en soles.
- Botón de acción (si aplica): avanza el pedido completo a la siguiente columna. Las columnas "Por pagar" y "Pagado" no tienen botón (esas transiciones las hace el mesero/caja).

---

## 📐 4. Layout
Una sola página, sin scroll global — el tablero puede scrollear horizontalmente en pantallas angostas. Grid responsivo: en pantallas < 1200px, colapsar a 2-3 columnas visibles con scroll horizontal del board completo.
