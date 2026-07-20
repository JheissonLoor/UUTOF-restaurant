# COMPONENT_INVENTORY — Admin Multi-local UTTOF

> Construir EN ORDEN. Screenshot + OK del usuario después de cada fase. `git commit` por componente.

## Fase A — Shell
1. **`<AdminLayout>`** — sidebar oscuro + área main. Sticky sidebar 248px.
2. **`<Sidebar>`** — logo + pill "MULTI-LOCAL", nav con grupos, ítems `★` premium, badge de sucursales, footer usuario. Item activo por ruta.
3. **`<ViewRouter>`** — React Router; una vista por ruta. Fade al cambiar.
4. **`<TopBar>`** — `h1` + subtítulo + slot de acciones (por vista).

## Fase B — Consolidado
5. **`<SucursalContext>`** — provider global `{ sucursalActiva, setSucursal }`, persistido en localStorage.
6. **`<KpiCard>`** — label + número Fraunces + delta (verde/rojo).
7. **`<KpiRow>`** — grid de 4 KpiCard (ingresos, pedidos, ticket prom., ocupación).
8. **`<BranchPerfTable>`** — tabla rendimiento por sucursal + fila total. Filas `rowlink` → Sucursales. Flags de color por local.
9. Cablear `GET /metricas/consolidado` + WebSocket `metricas.tick`.

## Fase C — Sucursales
10. **`<BranchCard>`** — header flag+nombre+dirección, mini-stats, footer chip inventario + "Administrar →".
11. **`<BranchGrid>`** — cards de las 3 sucursales.
12. **`<BranchCompareTable>`** — tabla comparativa (ingresos sem., ticket prom., reseñas, empleados, margen).
13. **`<NuevaSucursalModal>`** — form crear local (POST /sucursales).

## Fase D — Selector de sucursal + Inventario
14. **`<BranchSelector>`** — segmented control (`Toda la red` + una por local). Lee/escribe SucursalContext.
15. **`<InventoryAlertBar>`** — banda danger con conteo de críticos.
16. **`<InventoryTable>`** — insumo + pill sucursal + mini-barra de nivel + estado + sugerido. Estado automático por `nivel_pct`.
17. **`<OrdenCompraModal>`** — arma orden con los insumos bajo mínimo (POST /inventario/orden-compra).
18. Suscribir evento `insumo.reportado` (marca crítico en vivo desde el KDS 86-board).

## Fase E — Predicción IA
19. **`<ForecastBanner>`** — pronóstico + confianza + picos.
20. **`<ForecastChart>`** — curva de demanda del día (usa Recharts o similar).
21. **`<RecommendationList>`** — filas con ícono por tipo (comprar/staff/menú) + impacto + aplicar/descartar.
22. Cablear `GET /ia/prediccion` + `POST /ia/recomendaciones/{id}/aplicar`. Respeta BranchSelector.

## Fase F — Reportes exportables
23. **`<ReportCard>`** — título + rango + botones Exportar PDF / Excel (badges de formato).
24. **`<DateRangePicker>`** — hoy / 7d / 30d / personalizado.
25. Descarga vía `GET /reportes/{tipo}?formato=pdf|xlsx` con spinner.

## Fase G — Menú / Empleados por sucursal
26. **`<MenuManager>`** — CRUD de platos filtrado por sucursal (reusa lógica del Admin Pro).
27. **`<EmpleadosTable>`** — staff por sucursal, roles, estado.

## Fase H — Configuración (exclusivas Enterprise)
28. **`<ConfigTabs>`** — General · Integraciones · Marca blanca · Facturación.
29. **`<IntegracionesPanel>`** — conectores (contabilidad, delivery, SUNAT) con toggle + captura de API key + estado; sección developer para generar/revocar API keys propias.
30. **`<MarcaBlancaPanel>`** — subir logo, swatches de color primario, **preview en vivo** de las apps cliente/mesero con la marca. Guardar aplica al tenant.
31. **`<FacturacionPanel>`** — plan actual, sucursales facturadas, método de pago.

## Compartidos
- **`<Toast>`**, **`<Toggle>`**, **`<Chip>`** (estados ok/warn/crit), **`<StatPill>`**, **`<Skeleton>`**, **`<EmptyState>`**, **`<BranchFlag>`** (cuadrito de color con inicial).

## Notas de implementación
- Números con `tabular-nums`. Formatear moneda `S/ 1,234` en un helper `fmtSoles()`.
- Un solo hook `useSucursalQuery(endpoint)` que inyecta `id_sucursal` automáticamente.
- No hardcodear las 3 sucursales: vienen de `GET /sucursales`.
