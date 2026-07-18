import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getErrorDetail } from '@/api/errors';
import { avanzarPedido, getPedidos } from '@/api/pedidos';
import { Column } from '@/components/Column';
import { FilterTabs, type FilterKey } from '@/components/FilterTabs';
import { Topbar } from '@/components/Topbar';
import { ErrorState } from '@/components/ui/ErrorState';
import { BoardSkeleton } from '@/components/ui/Skeleton';
import { Toast } from '@/components/ui/Toast';
import { columns } from '@/data/columns';
import type { KitchenOrder, PedidoTransition, UsuarioSesion } from '@/types';

interface CocinaBoardProps {
  user: UsuarioSesion | null;
  onLogout: () => void;
}

function countByStatus(orders: KitchenOrder[]): Record<FilterKey, number> {
  const counts: Record<FilterKey, number> = { todos: orders.length, espera: 0, cocina: 0, listo: 0, entregado: 0, pagado: 0 };
  for (const order of orders) counts[order.estado] += 1;
  return counts;
}

export function CocinaBoard({ user, onLogout }: CocinaBoardProps): JSX.Element {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<FilterKey>('todos');
  const [mesaFilter, setMesaFilter] = useState('todas');
  const [toast, setToast] = useState<string | null>(null);
  const [advancingId, setAdvancingId] = useState<number | null>(null);

  const pedidosQuery = useQuery({
    queryKey: ['cocina-pro', 'pedidos'],
    queryFn: getPedidos,
    refetchInterval: 15000,
  });

  const transitionMutation = useMutation({
    mutationFn: ({ idPedido, transition }: { idPedido: number; transition: PedidoTransition }) => avanzarPedido(idPedido, transition),
    onMutate: ({ idPedido }) => setAdvancingId(idPedido),
    onSuccess: (updatedOrder) => {
      queryClient.setQueryData<KitchenOrder[]>(['cocina-pro', 'pedidos'], (current) => {
        if (!current) return [updatedOrder];
        return current.map((order) => (order.id_pedido === updatedOrder.id_pedido ? updatedOrder : order));
      });
      const target = columns.find((column) => column.id === updatedOrder.estado);
      setToast(`Pedido #${updatedOrder.num ?? updatedOrder.id_pedido} → ${target?.label ?? 'actualizado'}`);
      window.setTimeout(() => setToast(null), 2200);
    },
    onError: (error) => {
      setToast(getErrorDetail(error, 'No se pudo actualizar el pedido.'));
      window.setTimeout(() => setToast(null), 2600);
    },
    onSettled: () => {
      setAdvancingId(null);
      void queryClient.invalidateQueries({ queryKey: ['cocina-pro', 'pedidos'] });
    },
  });

  const orders = useMemo(() => pedidosQuery.data ?? [], [pedidosQuery.data]);
  const globalCounts = useMemo(() => countByStatus(orders), [orders]);
  const mesas = useMemo(() => [...new Set(orders.map((order) => order.mesa))].sort((a, b) => a - b), [orders]);
  const tableOrders = useMemo(
    () => mesaFilter === 'todas' ? orders : orders.filter((order) => order.mesa === Number(mesaFilter)),
    [mesaFilter, orders],
  );
  const counts = useMemo(() => countByStatus(tableOrders), [tableOrders]);
  const activeCount = counts.espera + counts.cocina;
  const visibleColumns = filter === 'todos' ? columns : columns.filter((column) => column.id === filter);

  return (
    <div className="h-[100dvh] overflow-hidden bg-cream-bg text-ink-900">
      <Topbar
        user={user}
        preparingCount={globalCounts.cocina}
        waitingCount={globalCounts.espera}
        readyCount={globalCounts.listo}
        onLogout={onLogout}
      />

      <main className="mx-auto flex h-[calc(100dvh-70px)] max-w-[1720px] flex-col px-5 py-5 lg:px-7 lg:py-6">
        <section className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="m-0 font-serif text-[34px] font-semibold text-ink-900">Panel de Cocina</h1>
            <p className="mt-1.5 text-sm text-ink-500">
              <b className="text-coral-600">{activeCount}</b> pedidos activos en cocina · {counts.listo} listos para servir
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label className="sr-only" htmlFor="cocina-mesa-filter">Filtrar por mesa</label>
            <select
              id="cocina-mesa-filter"
              value={mesaFilter}
              className="h-11 min-w-[170px] rounded-sm border border-[rgba(31,26,20,0.15)] bg-cream-surface px-3 text-[13px] font-semibold text-ink-700"
              onChange={(event) => setMesaFilter(event.target.value)}
            >
              <option value="todas">Todas las mesas</option>
              {mesas.map((mesa) => <option key={mesa} value={mesa}>Mesa {mesa}</option>)}
            </select>
            <button
              type="button"
              className="h-11 rounded-sm border border-[rgba(31,26,20,0.15)] bg-cream-surface px-4 text-[13px] font-semibold text-ink-700 transition hover:bg-cream-bg2 disabled:cursor-wait disabled:opacity-60"
              disabled={pedidosQuery.isFetching}
              onClick={() => void pedidosQuery.refetch()}
            >
              {pedidosQuery.isFetching ? 'Actualizando...' : 'Actualizar'}
            </button>
          </div>
        </section>

        <FilterTabs value={filter} counts={counts} onChange={setFilter} />

        {pedidosQuery.isError ? (
          <ErrorState message={getErrorDetail(pedidosQuery.error, 'No se pudo cargar. Reintentar.')} onRetry={() => void pedidosQuery.refetch()} />
        ) : null}

        {pedidosQuery.isLoading ? (
          <BoardSkeleton />
        ) : (
          <section
            className="scrollbar-thin grid min-h-0 flex-1 items-stretch gap-[15px] overflow-x-auto overflow-y-hidden pb-3"
            style={{ gridTemplateColumns: filter === 'todos' ? 'repeat(5, minmax(260px, 1fr))' : 'minmax(320px, 440px)' }}
          >
            {visibleColumns.map((column) => (
              <Column
                key={column.id}
                column={column}
                orders={tableOrders.filter((order) => order.estado === column.id)}
                onAdvance={(idPedido, transition) => transitionMutation.mutate({ idPedido, transition })}
                advancingId={advancingId}
              />
            ))}
          </section>
        )}

        {toast ? <Toast message={toast} /> : null}
      </main>
    </div>
  );
}
