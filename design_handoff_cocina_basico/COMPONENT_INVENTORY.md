# Component Inventory — Cocina Básico

## Fase A — Shell + topbar + tablero con datos de ejemplo
- Setup Vite + React + TS + Tailwind (usar tailwind.config.ts del paquete — tema CLARO).
- `src/components/Topbar.tsx` — marca, pill "Panel de Cocina", tag "Plan Básico", reloj, avatar cocinero.
- `src/pages/CocinaBoard.tsx` — grid de 5 columnas con datos mock primero.
- `src/components/Column.tsx` — header con punto de color + label + contador, body.
- `src/components/OrderCard.tsx` — folio, cliente, mesa, items, tiempo, total, botón de acción.

## Fase B — Conexión al backend
- `src/api/pedidos.ts` — getPedidos() con polling (react-query refetchInterval 15-20s).
- `src/api/client.ts` — axios + interceptor JWT.
- Reemplazar mock por datos reales.
- PATCH de transición al pulsar el botón de cada tarjeta.

## Fase C — Filtros y remates
- `src/components/FilterTabs.tsx` — Todos + una por columna con contador.
- Al filtrar a 1 columna, mostrarla ancha (no 5 columnas vacías).
- `src/components/ui/Toast.tsx` — confirmación al avanzar pedido.
- `src/components/ui/EmptyState.tsx`, `Skeleton.tsx`, `ErrorState.tsx`.

## Dependencias
```json
{
  "dependencies": {
    "react": "^18.3.1", "react-dom": "^18.3.1",
    "axios": "^1.6.7", "@tanstack/react-query": "^5.20.0", "clsx": "^2.1.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0", "vite": "^5.1.0", "@vitejs/plugin-react": "^4.2.0",
    "tailwindcss": "^3.4.0", "postcss": "^8.4.0", "autoprefixer": "^10.4.0",
    "@types/react": "^18.2.0", "@types/react-dom": "^18.2.0"
  }
}
```

## Checklist final
- [ ] Tablero de 5 columnas carga pedidos reales
- [ ] Botón de cada tarjeta avanza el pedido completo (PATCH)
- [ ] Polling refresca cada 15-20s sin parpadeo
- [ ] Filtros con contador correcto
- [ ] Tema claro, marca UTTOF, cero `any`, cero warnings en consola
