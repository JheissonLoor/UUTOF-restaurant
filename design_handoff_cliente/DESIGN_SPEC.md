# Design Spec — App Cliente UTTOF

> App móvil (web/PWA). Tema claro, marca UTTOF. 8 pantallas + navegación por tabs inferiores.

---

## 🎨 1. Paleta de colores

```ts
cream:  { bg: '#FAF6F0', bg2: '#F4ECE0', surface: '#FFFFFF' }
ink:    { 900: '#1F1A14', 700: '#3A322A', 500: '#6B6056', 400: '#9B9189' }
border: 'rgba(31,26,20,0.08)'
border2:'rgba(31,26,20,0.15)'

coral:  { DEFAULT: '#E94B33', 600: '#C93820', 700: '#9C2A17', 50: '#FDE8E2', 100: '#FACFC2' }  // primario
mint:   { DEFAULT: '#5BB39A', 600: '#3A8A72', 50: '#DEF1EA' }   // éxito, disponible
sun:    { DEFAULT: '#E8B14A', 600: '#B07E1E', 50: '#FBEFD1' }   // reservado, destacados
sky:    { DEFAULT: '#6B8FA8', 50: '#EEF3F8' }                    // info
```

---

## ✍️ 2. Tipografía
- **Fraunces** (500–700): títulos de pantalla, nombres de platillos destacados, precios grandes, "Mesa 5".
- **Inter** (400–700): todo el UI, descripciones, tabs.
- **JetBrains Mono**: folios de pedido, contadores, tiempos del tracker (`tnum`).

Import:
```html
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap" rel="stylesheet"/>
```

> App móvil: targets táctiles **mínimo 44×44px**.

---

## 🧩 3. Las 8 pantallas

### 0 · Escanear QR de mesa (entrada walk-in)
- Pantalla oscura de cámara con marco de escaneo + línea animada.
- "Apunta al código de tu mesa". Botón de respaldo "Ingresar número de mesa".
- Dirección del local abajo.

### 0b · Confirmación "Estás en la Mesa X"
- Check verde animado + "Estás en la Mesa 5".
- Tarjeta oscura con zona, mesa, capacidad.
- Los 4 pasos del flujo (pedir → cocina → seguir → pagar).
- CTA "Ver la carta".

### 1 · Inicio (Hero)
- Saludo dinámico según hora ("Buenas tardes"), nombre del cliente.
- Hero con CTA principal (Reservar / Ver carta).
- Accesos rápidos, platillos destacados (scroll horizontal con foto), stats (reservas activas, pedidos).

### 2 · Reservar mesa
- Selector de fecha, hora (chips, algunas marcadas "ocupado"), # personas.
- Plano del salón con mesas seleccionables por zona (disponible/reservada/ocupada).
- Resumen + "Confirmar reserva".

### 3 · Menú (carta)
- Tabs de categoría (Todos, Entradas, Platos Fuertes, Postres, Bebidas) con contadores.
- Buscador.
- Cards de platillo: foto, nombre, descripción, precio (S/), tiempo prep, favorito (♥), botón +/−.

### 4 · Carrito (drawer)
- Lista de ítems con foto, cantidad ajustable, subtotal.
- Total en soles + "Enviar a cocina" (NO cobra — postpago).

### 5 · Pedidos
- Filtro (todos / activos / historial).
- Cards de pedido con folio, fecha, mesa, estado, ítems, total.

### 6 · Checkout / Cuenta (postpago)
- Se abre al "pedir la cuenta". Pasos: revisar → pagar → éxito.
- Métodos: Tarjeta · Yape/QR · Efectivo (pago al mesero) · Mixto.
- Propina sugerida. Al elegir Yape muestra QR. Recibo digital con folio.

### 7 · Tracking en vivo
- Tras enviar pedido: 4 etapas animadas (recibido → preparando → listo → servido).
- Cronómetro, datos del mesero, resumen del pedido.
- CTA "Pedir la cuenta" cuando el pedido llega a servido.

---

## 🧭 4. Navegación
- **Tab bar inferior** fija: Inicio · Reservar · Menú · Pedidos (íconos + label).
- Carrito flotante (badge con # de ítems) accesible desde el menú.
- Modales/drawers para carrito, checkout y tracking (overlay, no cambian de tab).

---

## 📐 5. Layout
- Contenedor centrado tipo móvil (máx ~440px de ancho en desktop, full en móvil).
- Cada pantalla lleva `data-screen-label` (ver reference).
