# Data Contract — Cocina Kanban Pro

> Base: `http://localhost:8000/v1`. Requiere `Authorization: Bearer <jwt>` rol `cocina` o `admin`.

## GET `/v1/pedidos?estado=espera,cocina,listo,entregado,pagado`
```ts
Array<{
  id_pedido: number;
  cliente: string;
  mesa: number;
  estado: "espera" | "cocina" | "listo" | "entregado" | "pagado";
  origen: "app" | "mesero";     // ⚡ app cliente / ● tomado por mesero
  minutos: number;              // transcurridos desde creado_en (para aviso de urgencia > 20)
  items_listos: number;         // para la barra de progreso (listos / items.length)
  total: number;                // soles
  items: Array<{ qty: number; nombre: string; nota?: string }>;
}>
```
Refetch por **polling** cada 15s (`useQuery` con `refetchInterval: 15000`). No requiere WebSocket.

## PATCH `/v1/pedidos/{id}/estado`
```ts
{ transicion: "empezarPreparacion" | "marcarTerminado" | "entregarMesa" }
// mueve el pedido COMPLETO de columna. Al "marcarTerminado" el backend fija items_listos = items.length.
// El marcado por ítem individual es exclusivo del KDS de Multi-local.
```

## Errores
RFC 9457 Problem Details, igual que el resto de la API.

## Convenciones
- snake_case en JSON. Moneda soles (S/), zona horaria America/Lima.
