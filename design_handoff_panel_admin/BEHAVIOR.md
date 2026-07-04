# Behavior Spec — Panel Admin

> Interacciones, animaciones y estados de cada componente.

---

## 🎬 Estados globales que TODO componente debe manejar

| Estado | Cuándo aparece | Qué muestra |
|---|---|---|
| **Loading** | Mientras llega data del backend | Skeleton con shimmer (gris animado) |
| **Empty** | API responde con array vacío | Ilustración + mensaje + CTA opcional |
| **Error** | API responde 4xx/5xx | Card con icono ⚠️ + mensaje + botón "Reintentar" |
| **Success** | Operación completada | Toast verde 3s en esquina inferior derecha |

---

## 🔐 Login

### Flujo
1. Usuario llega a `/login`
2. Llena email + password
3. Click "Iniciar sesión"
4. Loading: botón muestra spinner, deshabilitado
5. Si OK:
   - Guardar `access_token` y `refresh_token` en localStorage
   - Redirect a `/` (Dashboard)
6. Si falla:
   - Mostrar error inline bajo el formulario
   - Limpiar password

### Validación
- Email: formato válido (regex simple)
- Password: mínimo 8 caracteres
- Mostrar errores en tiempo real al perder focus del input

### Refresh automático
- Interceptor de axios detecta 401
- Llama `POST /v1/auth/refresh` con `refresh_token`
- Si OK: reintenta la request original con el nuevo token
- Si falla: logout y redirect a `/login`

---

## 🧭 Navegación

### TabNav

- Click en tab cambia la URL: `/dashboard`, `/menu`, `/mesas`, etc.
- Animación: underline coral desliza horizontalmente entre tabs
  - `transition: left 300ms ease, width 300ms ease`
- Tab activa: color `ink-900`, demás `ink-500`
- Hover en tab inactiva: color `ink-700`

### Topbar

- **Icon "buscar"** → abre command palette (modal con input de búsqueda)
- **Icon "notificaciones"** → dropdown con últimas 10 notificaciones
  - Badge rojo si hay no leídas
  - Marcar como leídas al abrir dropdown
- **User chip** → dropdown con: Mi perfil · Configuración · Cerrar sesión
- **Icon "logout"** → confirm modal → logout → `/login`

---

## 📊 Dashboard

### Refresh automático
- Cada **30 segundos** refetch de `GET /v1/reportes/dashboard`
- Indicador sutil: pequeño punto verde pulsante "en vivo" arriba

### StatCards

- Al **cargar**, los números cuentan de 0 hasta su valor real
  - Duración: 800ms, ease-out
- **Hover** sobre la card: ligero translateY(-2px), shadow aumenta a `md`
- **Click** en la card: navega al detalle (ej. "Ingresos" → `/reportes?metric=ingresos`)

### Sparkline
- Pequeña área de 60×24px
- Color matching del stat (coral, sage, sky, saffron)
- Sin ejes ni labels
- Línea + área con gradient fill

### Revenue Chart

- Hover sobre el chart muestra tooltip con valor exacto + comparativa
- Toggle leyenda: click en "Esta semana" / "Anterior" oculta/muestra serie
- Periodo configurable: 7d / 14d / 30d / 90d (segmented control arriba)

### Top Platillos
- Cada renglón con barra de progreso horizontal (pct relativo al top 1)
- Hover muestra ranking exacto + cantidad vendida + ingresos generados

### Heatmap
- Cells con hover: tooltip con día + hora + cantidad
- Color interpolado de `cream-100` a `terracotta-500` según valor
- Legend abajo con escala

### Activity Feed
- Auto-scroll cuando llega nueva actividad (con animación fade-in)
- Click en un renglón abre detalle del recurso (mesa, pedido, reserva)
- Botón "Ver toda la actividad" abajo → modal con timeline completo

### Alertas
- Si hay alertas, banner sticky arriba del dashboard
- Click en "Resolver" llama endpoint correspondiente
- Click en "Posponer" oculta por 1h (guardar en localStorage)

---

## 🍽️ Menú (Tab Menú)

### Vista lista
- Grid de cards por categoría
- Cada platillo: imagen + nombre + precio + toggle disponible/agotado
- Filtros: categoría, disponibilidad, búsqueda por nombre

### Acciones por platillo
- **Editar**: modal con todos los campos
- **Cambiar disponibilidad**: toggle inline (sin modal)
- **Eliminar**: confirm modal

### Crear platillo
- Botón "+ Nuevo platillo" arriba a la derecha
- Modal con: nombre, categoría, precio, descripción, imagen, disponible

---

## 🪑 Mesas (Tab Mesas)

### Vista layout
- Grid visual de mesas (no tabla)
- Cada mesa con estado visual:
  - `libre` → bg sage-100, borde sage-500
  - `ocupada` → bg terracotta-100, borde terracotta-500
  - `reservada` → bg saffron-100, borde saffron-500
  - `limpieza` → bg ink-100, borde ink-400

### Click en mesa
- Modal con:
  - Pedido activo (si ocupada)
  - Botón "Cambiar estado" con dropdown
  - Tiempo en ese estado
  - Ticket actual

---

## 📅 Reservas

- Vista calendario semanal (lunes a domingo)
- Cada reserva como card con: hora, mesa, comensales, nombre del cliente
- Drag-and-drop para reasignar mesa (opcional)
- Click en slot vacío → modal para crear reserva manual

---

## 👥 Usuarios (Empleados)

- Tabla con: avatar + nombre + email + rol + estado (activo/inactivo) + acciones
- Filtro por rol

> Pendiente de contrato: el estado activo/inactivo se incorporara cuando el esquema oficial defina su columna y reglas de negocio.
- Botón "+ Nuevo usuario" → modal con form

---

## 📈 Reportes

- Filtros arriba: rango de fechas, granularidad (día/semana/mes)
- 4 charts grandes: Ingresos · Pedidos · Ticket promedio · Top platillos
- Botón "Exportar PDF" → genera PDF con todos los charts

---

## ⚙️ Config

- Tabs internas: Restaurante · Pagos · Notificaciones · Seguridad
- Cada tab con form de configuración
- Botón "Guardar" sticky abajo, solo aparece si hubo cambios

---

## 🎯 Toast notifications

Posición: bottom-right
Duración: 3 segundos (auto-dismiss)
Animación: slide-in desde derecha + fade out

Variantes:
- ✅ Success — bg sage-100, icono check, color sage-500
- ⚠️ Warning — bg saffron-100, icono alert, color saffron-500
- ❌ Error — bg wine-100, icono x, color wine-500
- ℹ️ Info — bg sky-100, icono info, color sky-500

---

## 🌗 Animaciones globales

- **Transición default:** 150ms ease
- **Hover en cards:** 200ms ease
- **Modal in:** 220ms cubic-bezier(.18,.9,.32,1.18) (slight overshoot)
- **Drawer in:** 280ms ease-out
- **Skeleton shimmer:** 1.5s infinite linear

---

## 🚨 Accesibilidad

- Todos los icon-buttons deben tener `aria-label`
- Modals con focus trap y cierre con Esc
- Contraste mínimo WCAG AA (4.5:1 para texto, 3:1 para UI)
- Soporte completo para navegación por teclado
- Skip link al inicio de la página
