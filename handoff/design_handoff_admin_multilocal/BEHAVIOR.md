# BEHAVIOR — Admin Multi-local UTTOF

> Interacciones, estados y lógica de cada vista. El prototipo (`reference/admin.html`) es la referencia de comportamiento.

## Navegación global
- Sidebar conmuta `.view` por `data-view`. Solo una visible (fade 0.22s). Estado de vista activa en la URL: `/admin/consolidado`, `/admin/ia`, etc. (React Router).
- Vistas: `consolidado` · `sucursales` · `ia` · `inventario` · `reportes` · `menu` · `empleados` · `config`.
- Filas `rowlink` (tabla consolidado) navegan a `sucursales`.

## Selector de sucursal (estado global)
- Un contexto global `sucursalActiva: number | "red"` (default `"red"` = Toda la red).
- Vive en el `top` de: IA, Inventario, Reportes, Menú, Empleados. Consolidado y Sucursales siempre muestran la red completa.
- Al cambiar, TODAS las consultas de la vista se refiltran por `id_sucursal` (o sin filtro si es `"red"`). No recargar la página; refetch con el nuevo parámetro.
- Persistir la última selección en `localStorage`.

## Vista Consolidado
- KPIs (ingresos hoy, pedidos, ticket promedio, ocupación) = agregados de todas las sucursales. Delta vs. semana pasada.
- Tabla "Rendimiento por sucursal" con fila total. Auto-refresh cada 60s (polling o WebSocket `metricas.tick`).

## Vista Sucursales
- Cards por local + tabla comparativa (ingresos sem., ticket prom., reseñas, empleados, margen).
- "+ Nueva sucursal" abre modal/form (crear local). "Administrar →" entra al detalle de esa sucursal (fija `sucursalActiva` y navega a config/menu de ese local).

## Vista Predicción IA
- Muestra pronóstico del modelo (`modelo v2.4`, confianza %). Recalcula cada noche 3:00 a.m. (no en cliente).
- "Acciones recomendadas": cada fila tiene una acción aplicable (ej. "Comprar 8 kg de pescado") con botón que crea la orden/tarea. Registrar `aceptada/descartada`.
- Selector de sucursal reencuadra el pronóstico.

## Vista Inventario
- Tabla de insumos con estado automático: `critico` (<15%), `bajo` (<35%), `ok`. Color de mini-barra y chip según estado.
- Banda de alerta arriba con conteo de críticos (link scrollea a los críticos).
- "Generar orden de compra" toma los insumos bajo el mínimo y arma un pedido sugerido (cantidad `sugerido`). Confirma en modal.
- Realtime: si el KDS reporta un insumo agotado (evento `insumo.reportado`), aparece aquí al instante como crítico.

## Vista Reportes
- Selector de rango (hoy / 7d / 30d / personalizado) + selector de sucursal.
- Cada card exporta: **PDF** (jsPDF o backend) y **Excel** (SheetJS o endpoint `?formato=xlsx`). Mostrar spinner mientras genera; descargar el archivo.

## Vista Configuración
Sub-tabs internos (no cambian la URL principal):
- **General**: datos del negocio, horarios, zona horaria.
- **Integraciones (API)**: toggles por conector (contabilidad, delivery, facturación SUNAT). Al activar, pedir credenciales/API key y validar (estado: conectado/error). Sección developer: generar/revocar API keys propias, ver docs de la API.
- **Marca blanca**: subir logo (preview), elegir color primario de swatches curados, previsualizar cómo se ven las apps de cliente/mesero con la marca. Guardar aplica el tema a todo el tenant.
- **Facturación**: plan actual (Multi-local S/599/local), sucursales facturadas, método de pago.

## Estados de carga / error
- Skeleton en cards y filas mientras cargan.
- Error de red → banner discreto "No se pudo cargar · reintentar".
- Empty states con texto guía (ej. inventario sin alertas = "Todo el stock en niveles saludables ✓").

## Permisos (RBAC)
- `dueño`: todo. `gerente_sucursal`: solo su sucursal (selector bloqueado a su local, sin config global ni marca blanca). El backend valida; el front oculta lo no permitido.

## Toasts
- Acciones (exportar, generar orden, guardar config, aplicar marca) confirman con toast efímero (~2s).
