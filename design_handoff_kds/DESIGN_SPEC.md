# Design Spec — KDS Cocina UTTOF

> Tema oscuro, alto contraste. Pantalla grande (monitor/tablet horizontal), NO móvil.

---

## 🎨 1. Paleta de colores

```ts
// Base oscura
bg:       { DEFAULT: '#0F1014', 2: '#181A21' }
surface:  { DEFAULT: '#1F222B', 2: '#262A35' }
border:   'rgba(255,255,255,0.08)'
border2:  'rgba(255,255,255,0.16)'
ink:      { DEFAULT: '#F4F1EA', 2: '#C8C2B8', 3: '#8A847B', 4: '#5A554E' }

// Estados de ticket
coral:  { DEFAULT: '#F26B53', 600: '#E94B33', 700: '#C93820', bg: 'rgba(233,75,51,0.12)' }  // cocinando
mint:   { DEFAULT: '#5BD4B0', 600: '#4FA88E', bg: 'rgba(91,212,176,0.14)' }                  // listo
sun:    { DEFAULT: '#F5C04A', bg: 'rgba(245,192,74,0.14)' }                                  // nuevo
danger: { DEFAULT: '#FF5C42', bg: 'rgba(255,92,66,0.16)' }                                   // urgente
```

### Colores por estado de ticket
| Estado | Franja lateral | Fondo tarjeta |
|---|---|---|
| `new` (nuevo) | sun | surface, borde sutil sun |
| `cooking` (cocinando) | coral | surface |
| `urgent` (urgente) | danger, con pulso | surface, borde danger |
| `ready` (listo) | mint | surface, borde mint |

---

## ✍️ 2. Tipografía

| Familia | Uso |
|---|---|
| **Inter** (400-700) | Todo el UI — esta pantalla es funcional, no editorial |
| `tnum` (tabular-nums) | Cronómetros, contadores, horas |
| Fraunces | Solo para el nombre de marca "UTTOF" en el topbar |

Tamaños base más grandes que apps móviles (visibilidad a distancia):
| Elemento | Tamaño |
|---|---|
| Número de ticket (#89) | 20px bold |
| Cronómetro | 22px tabular, bold |
| Nombre de platillo | 15px medium |
| Stat del topbar | 20px bold |

---

## 📐 3. Layout general

Grid de **4 filas fijas**: topbar (60px) · filtros (60px) · board (flexible, scroll) · footer (56px). `100vw x 100vh`, sin scroll de página — solo el board scrollea.

Board: grid `repeat(auto-fill, minmax(290px, 1fr))`, gap 14px. Cada ticket es una tarjeta independiente, no una lista.

---

## 🧩 4. Componentes

### 4.1 — Topbar
- Marca UTTOF + "Cocina · KDS" a la izquierda.
- 3 stats centrales: en preparación (coral), nuevos (sun), listos (mint) — ícono + valor grande + label.
- Reloj en vivo (es-PE) + fecha + chip del cocinero activo ("Chef Mario").

### 4.2 — Barra de filtros
- Tabs: Activos · Nuevos · Cocinando · Urgentes · Listos — cada uno con badge de conteo.
- Toggle de vista: Tarjetas / Lista.
- Botón de pantalla completa.

### 4.3 — Ticket (tarjeta)
- Franja de color lateral según estado.
- Header: `#89` grande + mesa + origen (ícono rayo si viene de app cliente, ícono plato si lo tomó el mesero) + mesero + **cronómetro** (mm:ss, cambia a rojo si `elapsed > target`).
- Barra de progreso: `N/total` ítems completados.
- Lista de ítems: qty badge, nombre, modificadores (chips), nota de alergia (⚠, resaltada), checkbox visual — **tap en todo el renglón marca/desmarca**.
- Footer: botón principal según estado —
  - Si faltan ítems: **"En preparación"** (deshabilitado hasta completar todos, o funciona como toggle informativo).
  - Si todos listos: **"Listo para servir"** → avanza el ticket completo a `ready`.
  - Si ya está `ready`: botón **"Entregado"** (verde éxito) — opcional, normalmente lo hace el mesero, pero cocina puede confirmar el traspaso.
  - Botón "···" secundario (más acciones: pausar, reportar falta de insumo).

### 4.4 — Footer / leyenda
- Leyenda de colores (Nuevo/Cocinando/Urgente/Listo).
- Pills de métricas: tiempo promedio, hora pico, tickets servidos hoy.

---

## ⏱️ 5. Cronómetro y urgencia

- Cada ticket cuenta `elapsed` en tiempo real (sube cada segundo).
- Cuando `elapsed > target * 0.95` → el ticket pasa automáticamente a estado visual `urgent` (franja roja, pulso sutil).
- El cronómetro muestra `mm:ss` con `tnum` y cambia de color: normal (ink) → coral (acercándose) → rojo (excedido), con label "Sobre tiempo".

---

## 📺 6. Consideraciones de pantalla grande

- Sin hover states complejos — todo es tap/click directo (pantalla táctil o mouse desde lejos).
- Texto legible a 1-2 metros de distancia — nunca reducir tamaños de fuente por debajo de la spec.
- Sin animaciones largas — los cocineros necesitan feedback instantáneo.
