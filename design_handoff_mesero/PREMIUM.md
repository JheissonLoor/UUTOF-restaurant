# PREMIUM.md — Features Premium de la App Mesero

> Construir SOLO con plan Premium (`usuario.plan === "premium"`). En básico, no se muestran (o aparecen bloqueadas con CTA de upgrade).
> Referencia visual: `reference/mesero-premium.html`.

---

## 1. Sugerencias de upselling

### Dónde aparece
- En el **detalle de mesa**, después de la lista de ítems del pedido: tarjeta oscura "Sugerencia inteligente".
- Contenido: platillo sugerido, razón con dato ("68% de las mesas con lomo saltado aceptan un sour"), precio, botones [+ Agregar · S/ X] y [Ahora no].
- Sección "También combina" debajo: 2 sugerencias secundarias en filas simples con +.

### Endpoint
```
GET /v1/pedidos/{id}/sugerencias
→ [{ id_platillo, nombre, precio, razon, conversion_pct, tipo: "principal"|"combina" }]
```
- El backend calcula las sugerencias con reglas simples: co-ocurrencia de platillos en pedidos históricos del local (SQL GROUP BY sobre detalle_pedido). No requiere ML real.
- Al pulsar "Agregar": mismo `POST /v1/pedidos/{id}/items` de siempre + registra `origen: "upsell"` para el ranking.

## 2. Ranking del turno

### Nueva pantalla (tab "Ranking" en tab bar inferior)
- Hero oscuro: tu posición (#2 de 5) + stats: vendido, propinas, mesas, upsells.
- Lista del ranking completo del turno: posición, avatar con iniciales, nombre, mesas + upsells, monto vendido. Tu fila resaltada en coral.
- Teaser en el home (pantalla Mesas): banda oscura "Vas 2do del turno · S/ 606 · Ver ranking →" entre el saludo y las stats.

### Endpoint
```
GET /v1/turnos/actual/ranking
→ { mi_posicion, meseros: [{ id_usuario, nombre, mesas, upsells, vendido, propinas }] }
```
- Solo agregación SQL de pedidos pagados del turno agrupados por mesero.
- Actualiza por polling 60s (no necesita WebSocket).

## 3. Tab bar
Premium agrega tab bar inferior: Mesas · Ranking · Historial. En básico solo existe la vista Mesas (sin tab bar o con Ranking bloqueado 🔒).
