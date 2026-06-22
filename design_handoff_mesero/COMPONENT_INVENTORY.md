# Component Inventory — App Mesero

> Componentes React a construir, en orden. Screenshot + OK tras cada fase.

---

## 🟢 Fase A — Shell + Lista de mesas

### A1. Setup
- Vite + React 18 + TS + Tailwind (usar `tailwind.config.ts` del paquete).
- Layout móvil: contenedor `100dvh`, `overflow:hidden`, una columna.
- Fuentes Fraunces + Inter.

### A2. API + Auth + Realtime
- `src/api/client.ts` — axios + interceptor JWT.
- `src/api/mesas.ts`, `src/api/pedidos.ts`, `src/api/pagos.ts`.
- `src/auth/AuthContext.tsx` — login, sesión del mesero.
- `src/realtime/useWebSocket.ts` — hook que escucha eventos del bus.
- `src/types/api.ts` — tipos del DATA_CONTRACT.

### A3. Shell + Topbar
- `src/components/Topbar.tsx` — saludo, turno, 3 stat cards, buscador.
- `src/components/FilterTabs.tsx` — Todas/Ocupadas/Atención/Libres con counts.

### A4. Lista de mesas
- `src/pages/MesasView.tsx` — grid 2 col, refetch 20s + WebSocket.
- `src/components/MesaCard.tsx` — estados libre/ocupada/lista, badge alerta, total S/.
- `src/components/NuevaOrdenButton.tsx` — abre flujo sentar comensales.

---

## 🔵 Fase B — Detalle de mesa

- `src/pages/MesaDetail.tsx` — order card oscura + acciones + lista + footer.
- `src/components/OrderCard.tsx` — total grande, curso, chips de meta.
- `src/components/QuickActions.tsx` — Llamar cocina, Dividir, Cambiar mesa, Cuenta QR.
- `src/components/OrderItem.tsx` — qty badge, nombre+nota, tag de estado, precio S/.
  - Acción "marcar entregado" en ítems `ready`.
- `src/components/DetailFooter.tsx` — Agregar platillo + Cobrar cuenta.

---

## 🟡 Fase C — Agregar platillos

- `src/pages/AddDishes.tsx` — tabs de categoría + lista.
- `src/components/CategoryTabs.tsx`
- `src/components/DishRow.tsx` — imagen, nombre, desc, precio, tiempo, picante, stepper.
- `src/components/FloatingCart.tsx` — count + total + "Enviar a cocina".

---

## 🟠 Fase D — Sheets (bottom sheets)

- `src/components/sheets/Sheet.tsx` — wrapper genérico (backdrop, handle, header, footer, swipe-down).
- `src/components/sheets/ModSheet.tsx` — modificadores + stepper + "Agregar · S/ X".
- `src/components/sheets/SplitSheet.tsx` — 3 modos de división.
- `src/components/sheets/PaySheet.tsx` — método + propina + **verificación de efectivo**:
  - bloque "¿Con cuánto paga el cliente?" con denominaciones,
  - cálculo de cambio,
  - botón "Confirmar S/ X recibidos".
- `src/components/PaySuccess.tsx` — círculo mint + "¡Pago completado!".

---

## 🟣 Fase E — Estados y remates

- `src/components/ui/Skeleton.tsx`, `EmptyState.tsx`, `ErrorState.tsx`.
- `src/components/ui/Toast.tsx` — pill flotante con check, auto-dismiss 2.2s.
- `src/components/SentarComensales.tsx` — mini-form # personas para mesa libre.
- Conectar WebSocket: mesa pasa a `lista` con pulso al recibir `pedido.listo`.

---

## 📦 Dependencias mínimas

```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.22.0",
    "axios": "^1.6.7",
    "@tanstack/react-query": "^5.20.0",
    "clsx": "^2.1.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "vite": "^5.1.0",
    "@vitejs/plugin-react": "^4.2.0",
    "tailwindcss": "^3.4.0",
    "@tailwindcss/forms": "^0.5.7",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0"
  }
}
```

---

## ✅ Checklist final

- [ ] Login mesero filtra solo sus mesas
- [ ] Lista de mesas con 3 estados y badge de atención
- [ ] WebSocket: mesa pasa a "lista" al terminar cocina
- [ ] Detalle muestra ítems con estado sincronizado
- [ ] Marcar entregado funciona (PATCH)
- [ ] Agregar platillos → enviar a cocina (ítems en_cocina + ding al KDS)
- [ ] PaySheet: tarjeta/yape al instante
- [ ] PaySheet: efectivo muestra cambio y "Confirmar S/ X recibidos"
- [ ] Dividir cuenta en 3 modos
- [ ] Todo en soles (S/), formato es-PE
- [ ] Targets táctiles ≥ 44px
- [ ] Cero `any`, cero warnings en consola
