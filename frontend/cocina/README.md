# UTTOF Cocina - Operación Pro

Tablero Kanban dedicado para el equipo de cocina. Consume pedidos reales del backend y actualiza la operación cada 15 segundos, sin WebSocket ni acciones por platillo individual.

## Funciones

- Acceso protegido para los roles `cocina` y `admin`.
- Cinco columnas: En espera, En preparación, Terminado, Por pagar y Pagado.
- Avance del pedido completo mediante transiciones del backend.
- Origen del pedido: App Cliente o Mesero.
- Progreso informativo por platillos y aviso visual después de 20 minutos.
- Estadísticas del turno, filtro por estado y mesa, refresco manual y toast.
- Estados de carga, vacío y error.

El KDS oscuro con WebSocket, sonido, cronómetros configurables, marcado individual y falta de insumos pertenece al plan Multi-local.

## Ejecutar

```powershell
npm.cmd install
npm.cmd run dev
```

URL: `http://127.0.0.1:5175`

Credenciales: `cocina@uttof.pe` / `cocina123`

## Validar

```powershell
npm.cmd run lint
npm.cmd run build
```
