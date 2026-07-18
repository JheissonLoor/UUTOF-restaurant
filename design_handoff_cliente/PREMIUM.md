# PREMIUM.md — Features Premium de la App Cliente

> Construir SOLO con plan Premium (`usuario.plan === "premium"` a nivel local/restaurante). En básico no se muestran.
> Referencia visual: `reference/cliente-premium.html`.

---

## 1. Programa de lealtad (UTTOF Rewards)

### Dónde aparece
- **Home**: tarjeta oscura arriba del hero — puntos actuales (640 pts), nivel (Oro, badge dorado), barra de progreso al siguiente canje, nota "360 pts para tu próximo canje".
- **Home**: sección "Canjes disponibles" — filas con costo en pts y recompensa.
- **Checkout éxito**: "Ganaste 56 pts UTTOF" tras pagar.

### Reglas de negocio
- 1 punto por cada S/ 1 pagado (solo pedidos `pagado`).
- Niveles: Bronce (0+), Plata (1000+ acumulados), Oro (3000+).
- Canjes definidos por el admin (tabla `recompensa`: nombre, costo_pts, activa).

### Endpoints
```
GET  /v1/lealtad/mi-cuenta   → { puntos, nivel, siguiente_canje: { nombre, faltan_pts } }
GET  /v1/lealtad/recompensas → [{ id, nombre, costo_pts }]
POST /v1/lealtad/canjear     → { id_recompensa }  (genera cupón aplicable al pedido)
```
- Tablas nuevas: `puntos_movimiento` (id_usuario, delta, id_pedido, ts) y `recompensa`.

## 2. Pago dividido entre comensales

### Flujo
1. En el checkout, opción "Dividir la cuenta" (además de pagar todo).
2. Pantalla: total de la mesa arriba (tarjeta oscura) + una fila por comensal con su parte:
   - División **por platillo** (cada quien lo suyo, calculado de los ítems que agregó cada sesión) o **partes iguales**.
3. Cada comensal recibe un **enlace/QR con su parte exacta** — paga desde su propio celular (Yape/tarjeta).
4. Estados por fila: `Pagado ✓` (verde) / `Pendiente` (ámbar) / `Tu parte` (resaltada coral con CTA "Pagar mi parte · S/ X").
5. La mesa se libera cuando TODAS las partes están pagadas (o el mesero cobra el resto en efectivo).

### Endpoints
```
POST /v1/pedidos/{id}/dividir   → { modo: "por_platillo"|"iguales", partes: n? }
     → [{ id_parte, nombre?, monto, url_pago, estado }]
GET  /v1/pedidos/{id}/partes    → estado en vivo de cada parte
POST /v1/pagos                  → igual que siempre + { id_parte }
```
- WebSocket `pago.parte_pagada` → actualiza las filas en vivo en todos los celulares de la mesa.

## 3. Gating
- `GET /v1/config/local` devuelve `{ plan }`. Hook `usePlan()`.
- En básico: sin tarjeta de lealtad; "Dividir la cuenta" visible pero bloqueada 🔒 con modal de upgrade.
