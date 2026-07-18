# PREMIUM.md — Features Premium del Panel Admin

> Construir SOLO si el local tiene plan Premium (S/ 299). Se activan con el flag `plan: "premium"` que devuelve `/v1/auth/login` en el objeto usuario. Si el plan es `basico`, estos módulos NO se muestran (o se muestran bloqueados con CTA de upgrade).
> Referencia visual: `reference/admin-premium.html`.

---

## 1. Inventario con alertas automáticas

### Pantalla `/inventario` (nueva entrada en el sidebar, con ★)
- Tabla de insumos: nombre, stock (cantidad + unidad), barra de nivel (%), badge de estado.
- Estados por nivel: `crítico` (<15%, rojo), `bajo` (<40%, ámbar), `ok` (verde).
- Banner superior cuando hay ≥1 insumo crítico: "N insumos en nivel crítico. Alerta enviada automáticamente".
- Panel lateral "Alertas automáticas" con toggles de reglas:
  - Stock crítico <15% → notifica a admin + cocina
  - Stock bajo <40% → aviso en dashboard
  - Sugerencia de compra (calcula cuánto pedir según ventas)
  - Merma inusual (consumo fuera de lo normal)
- Botón "Registrar compra" (form: insumo, cantidad, costo).

### Endpoints
```
GET   /v1/insumos                → [{ id_insumo, nombre, stock, unidad, nivel_pct, estado }]
PATCH /v1/insumos/{id}           → { stock }  (registrar compra/ajuste)
GET   /v1/insumos/alertas        → reglas configuradas
PATCH /v1/insumos/alertas/{id}   → { activa: boolean }
```
El backend evalúa las reglas en cada venta (el detalle_pedido descuenta insumos por receta) y emite WebSocket `insumo.alerta` → el dashboard muestra el banner en vivo.

### Widget en dashboard
- Card "Inventario ★" con los 3 insumos más bajos + banner si hay críticos.

## 2. Reportes exportables (PDF / Excel)

- Botones "Exportar PDF" y "Excel" (con tag ★) en el header del dashboard y en /reportes.
- Endpoints:
```
GET /v1/reportes/ventas/export?formato=pdf|xlsx&from=&to=
```
- Backend: genera el archivo (reportlab/openpyxl en Python) y responde con `Content-Disposition: attachment`.
- Frontend: `window.open()` o descarga con blob. Toast "Reporte descargado".

## 3. Gating por plan
- `usuario.plan` viene en el login. Crear hook `usePlan()` → `{ isPremium }`.
- Plan básico: entrada "Inventario" del sidebar visible pero con candado 🔒; al click, modal de upgrade con precio y features (ver `UTTOF Planes v2`).
- Los botones de export en básico muestran el mismo modal.
