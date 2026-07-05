# Component Inventory — App Cliente

> Componentes React a construir, en orden. Screenshot + OK tras cada fase.

---

## 🟢 Fase A — Shell + entrada walk-in
- Setup Vite + React + TS + Tailwind (tema claro, paleta UTTOF).
- `src/api/client.ts` (axios + JWT), `src/auth/AuthContext.tsx`.
- `src/realtime/useWebSocket.ts`, `src/hooks/useMesaSession.ts` (sesión de mesa en localStorage).
- `src/pages/ScanQR.tsx` — cámara + marco + "Ingresar número manual".
- `src/pages/CheckinConfirm.tsx` — "Estás en la Mesa X" + pasos + "Ver la carta".

## 🔵 Fase B — Shell de app + navegación
- `src/components/TabBar.tsx` — Inicio/Reservar/Menú/Pedidos.
- `src/components/AppShell.tsx` — contenedor móvil + tab bar + slot de overlays.
- `src/pages/Inicio.tsx` — saludo dinámico, hero, destacados (scroll horizontal), stats.

## 🟡 Fase C — Menú + Carrito
- `src/pages/Menu.tsx` — tabs de categoría, buscador, grid de platillos.
- `src/components/DishCard.tsx` — foto, nombre, desc, precio S/, favorito, +/−.
- `src/hooks/useCart.ts` — estado del carrito en localStorage.
- `src/components/CartDrawer.tsx` — lista, ajustar cantidades, "Enviar a cocina".

## 🟠 Fase D — Pedido + Tracking
- Lógica "Enviar a cocina" → POST pedidos/items (ítems en_cocina + ding KDS).
- `src/components/Tracker.tsx` — 4 etapas animadas, cronómetro, mesero, resumen.
- Conexión WebSocket: avanzar etapas; al llegar a servido mostrar "Pedir la cuenta".

## 🟣 Fase E — Checkout postpago
- `src/components/Checkout.tsx` — pasos revisar → pagar → éxito.
- Métodos: Tarjeta / Yape (QR) / Efectivo (pago al mesero) / Mixto.
- Propina, recibo digital con folio, opción de reseña.
- Efectivo: mostrar "Pagar al mesero" y esperar evento `pago.verificado`.

## 🔴 Fase F — Reservar + Pedidos + remates
- `src/pages/Reservar.tsx` — fecha/hora/personas + plano de mesas + confirmar.
- `src/pages/Pedidos.tsx` — filtro + cards de pedido (activos/historial).
- `src/components/ui/` — Toast, Skeleton, EmptyState, ErrorState.
- Persistencia de carrito y sesión de mesa; badge del carrito en vivo.

---

## 📦 Dependencias mínimas
```json
{
  "dependencies": {
    "react": "^18.3.1", "react-dom": "^18.3.1",
    "react-router-dom": "^6.22.0", "axios": "^1.6.7",
    "@tanstack/react-query": "^5.20.0", "clsx": "^2.1.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0", "vite": "^5.1.0", "@vitejs/plugin-react": "^4.2.0",
    "tailwindcss": "^3.4.0", "@tailwindcss/forms": "^0.5.7",
    "postcss": "^8.4.0", "autoprefixer": "^10.4.0",
    "@types/react": "^18.2.0", "@types/react-dom": "^18.2.0"
  }
}
```

## ✅ Checklist final
- [ ] App abre en escaneo de QR (no en el home)
- [ ] Check-in guarda la sesión de mesa
- [ ] Menú carga platillos reales con precios S/
- [ ] Carrito persiste y "Enviar a cocina" NO cobra (postpago)
- [ ] Tracker avanza en vivo por WebSocket
- [ ] "Pedir la cuenta" abre checkout con 4 métodos
- [ ] Efectivo espera verificación del mesero
- [ ] Reservar y Pedidos funcionan
- [ ] Cero `any`, cero warnings en consola
