import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { avanzarPedido, getPedidos } from '@/api/pedidos';
import { getErrorDetail } from '@/api/errors';
import { Column } from '@/components/Column';
import { FilterTabs, type FilterKey } from '@/components/FilterTabs';
import { HashIcon } from '@/components/icons';
import { ErrorState } from '@/components/ui/ErrorState';
import { BoardSkeleton } from '@/components/ui/Skeleton';
import { Toast } from '@/components/ui/Toast';
import { columns } from '@/data/mockOrders';
import type { KitchenOrder, PedidoTransition } from '@/types';

export function CocinaBoard(): JSX.Element {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<FilterKey>('todos');
  const [toast, setToast] = useState<string | null>(null);
  const [advancingId, setAdvancingId] = useState<number | null>(null);

  const pedidosQuery = useQuery({
    queryKey: ['cocina-basico', 'pedidos'],
    queryFn: getPedidos,
    refetchInterval: 20000,
  });

  const transitionMutation = useMutation({
    mutationFn: ({ idPedido, transition }: { idPedido: number; transition: PedidoTransition }) => avanzarPedido(idPedido, transition),
    onMutate: ({ idPedido }) => {
      setAdvancingId(idPedido);
    },
    onSuccess: (updatedOrder) => {
      queryClient.setQueryData<KitchenOrder[]>(['cocina-basico', 'pedidos'], (current) => {
        if (!current) return [updatedOrder];
        return current.map((order) => (order.id_pedido === updatedOrder.id_pedido ? updatedOrder : order));
      });
      const target = columns.find((column) => column.id === updatedOrder.estado);
      setToast(`Pedido #${updatedOrder.id_pedido} -> ${target?.label ?? 'actualizado'}`);
      window.setTimeout(() => setToast(null), 2200);
    },
    onError: (error) => {
      setToast(getErrorDetail(error, 'No se pudo actualizar el pedido.'));
      window.setTimeout(() => setToast(null), 2600);
    },
    onSettled: () => {
      setAdvancingId(null);
      void queryClient.invalidateQueries({ queryKey: ['cocina-basico', 'pedidos'] });
    },
  });

  const orders = pedidosQuery.data ?? [];

  const counts = useMemo(() => {
    const base: Record<FilterKey, number> = { todos: orders.length, espera: 0, cocina: 0, listo: 0, entregado: 0, pagado: 0 };
    for (const order of orders) base[order.estado] += 1;
    return base;
  }, [orders]);

  const activeCount = counts.espera + counts.cocina;
  const visibleColumns = filter === 'todos' ? columns : columns.filter((column) => column.id === filter);

  function handleAdvance(idPedido: number, transition: PedidoTransition): void {
    transitionMutation.mutate({ idPedido, transition });
  }

  return (
    <main className="mx-auto flex h-[calc(100dvh-64px)] max-w-[1720px] flex-col px-7 py-7">
      <section className="mb-5 flex items-end justify-between gap-5">
        <div>
          <h1 className="m-0 font-serif text-[34px] font-semibold tracking-[-0.01em] text-ink-900">Panel de Cocina</h1>
          <p className="mt-1.5 text-sm text-ink-500">
            <b className="text-coral-600">{activeCount}</b> pedidos activos en cocina - {counts.listo} listos para servir
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" className="flex items-center gap-2 rounded-sm border border-[rgba(31,26,20,0.15)] bg-cream-surface px-4 py-2.5 text-[13.5px] font-semibold text-ink-700">
            <HashIcon size={14} />
            Todas las mesas
          </button>
          <button
            type="button"
            className="rounded-sm border border-[rgba(31,26,20,0.15)] bg-cream-surface px-4 py-2.5 text-[13.5px] font-semibold text-ink-700 transition hover:bg-cream-bg2 disabled:cursor-wait disabled:opacity-60"
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
          className="scrollbar-thin grid flex-1 items-start gap-4 overflow-x-auto pb-3"
          style={{ gridTemplateColumns: filter === 'todos' ? 'repeat(5, minmax(260px, 1fr))' : 'minmax(320px, 420px)' }}
        >
          {visibleColumns.map((column) => (
            <Column
              key={column.id}
              column={column}
              orders={orders.filter((order) => order.estado === column.id)}
              onAdvance={handleAdvance}
              advancingId={advancingId}
            />
          ))}
        </section>
      )}

      {toast ? <Toast message={toast} /> : null}
    </main>
  );
}
