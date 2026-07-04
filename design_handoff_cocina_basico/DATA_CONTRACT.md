# Data Contract — Cocina Básico

> Base: `http://localhost:8000/v1`. Requiere `Authorization: Bearer <jwt>` rol `cocina` o `admin`.

## GET `/v1/pedidos?estado=espera,cocina,listo,entregado,pagado`
```ts
Array<{
  id_pedido: number;
  cliente: string;
  mesa: number;
  estado: "espera" | "cocina" | "listo" | "entregado" | "pagado";
  minutos: number;          // transcurridos desde creado_en
  total: number;            // soles
  items: Array<{ qty: number; nombre: string; nota?: string }>;
}>
```
Refetch por **polling** cada 15-20s (`useQuery` con `refetchInterval`). No requiere WebSocket.

## PATCH `/v1/pedidos/{id}/estado`
```ts
{ transicion: "empezarPreparacion" | "marcarTerminado" | "entregarMesa" }
// mueve el pedido COMPLETO de columna (no por ítem — eso es exclusivo del plan Premium)
```

## Errores
RFC 9457 Problem Details, igual que el resto de la API.

## Convenciones
- snake_case en JSON. Moneda soles (S/), zona horaria America/Lima.
