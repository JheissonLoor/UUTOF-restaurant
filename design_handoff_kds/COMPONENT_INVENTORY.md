# Component Inventory — KDS Cocina

> Componentes React a construir, en orden. Screenshot + OK tras cada fase.

---

## 🟢 Fase A — Shell + topbar + tickets básicos

### A1. Setup
- Vite + React 18 + TS + Tailwind (usar `tailwind.config.ts` del paquete — **tema oscuro**).
- Layout `100vw x 100vh`, sin scroll de página (grid de 4 filas fijas).
- Fuente Inter (+ Fraunces solo para el logo).

### A2. API + Auth + Realtime
- `src/api/client.ts` — axios + interceptor JWT.
- `src/api/pedidos.ts` — getTicketsActivos(), marcarItem(), avanzarEstado().
- `src/auth/AuthContext.tsx` — login cocina.
- `src/realtime/useWebSocket.ts` — hook con reconexión automática.
- `src/hooks/useElapsedTimer.ts` — cronómetro local por ticket (setInterval 1s).
- `src/types/api.ts` — tipos del DATA_CONTRACT.

### A3. Topbar
- `src/components/Topbar.tsx` — marca, 3 stats (preparación/nuevos/listos), reloj es-PE, chip de cocinero.

### A4. Board + Ticket básico
- `src/pages/KdsBoard.tsx` — grid de tickets, fetch inicial + WebSocket.
- `src/components/Ticket.tsx` — header, cronómetro, lista de ítems (sin interacción aún).

---

## 🔵 Fase B — Interacción de ítems y transición de estados

- `src/components/TicketItem.tsx` — toggle done/undone, chips de modificadores, nota de alergia resaltada.
- `src/components/ProgressBar.tsx` — N/total.
- Lógica: al completar todos los ítems → PATCH marcarListo + WebSocket.
- `src/components/TicketFooter.tsx` — botón principal según estado (En preparación / Listo para servir / Entregado).

---

## 🟡 Fase C — Filtros, urgencia y vistas

- `src/components/FilterTabs.tsx` — Activos/Nuevos/Cocinando/Urgentes/Listos con badges.
- `src/components/ViewToggle.tsx` — Tarjetas/Lista.
- Lógica de urgencia automática (elapsed > target*0.95 → estado visual urgent, franja roja + pulso).
- Ordenar tickets urgentes primero.
- `src/components/FullscreenButton.tsx` — Fullscreen API.

---

## 🟠 Fase D — Acciones secundarias

- `src/components/TicketMenu.tsx` — menú "···": Reportar falta de insumo, Pausar ticket.
- `src/components/modals/ReportarInsumoModal.tsx`.
- Sonido "ding" al llegar ticket nuevo (con botón de silenciar en topbar).

---

## 🟣 Fase E — Footer y remates

- `src/components/Footer.tsx` — leyenda de colores + pills de métricas (tiempo promedio, hora pico, servidos hoy).
- `src/components/ui/Skeleton.tsx`, `EmptyState.tsx`, `ErrorState.tsx` (banner de reconexión).
- Highlight visual de 1.5s al insertar ticket nuevo.

---

## 📦 Dependencias mínimas

```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "axios": "^1.6.7",
    "@tanstack/react-query": "^5.20.0",
    "clsx": "^2.1.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "vite": "^5.1.0",
    "@vitejs/plugin-react": "^4.2.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0"
  }
}
```

---

## ✅ Checklist final

- [ ] Login cocina carga tickets activos
- [ ] Ticket nuevo llega vía WebSocket con sonido + highlight
- [ ] Marcar ítem individual funciona (PATCH)
- [ ] Al completar todos los ítems, ticket pasa a "listo" automáticamente
- [ ] Cronómetro corre en vivo y cambia a urgente pasado el objetivo
- [ ] Filtros y badges de conteo correctos
- [ ] Pantalla completa funciona
- [ ] Reportar falta de insumo envía notificación
- [ ] Tema oscuro, alto contraste, texto legible a distancia
- [ ] Cero `any`, cero warnings en consola
