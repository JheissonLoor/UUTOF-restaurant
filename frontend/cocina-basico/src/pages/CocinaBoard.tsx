import { useMemo, useState } from 'react';

import { Column } from '@/components/Column';
import { HashIcon } from '@/components/icons';
import { columns, initialOrders } from '@/data/mockOrders';
import type { KitchenOrder, OrderStatus } from '@/types';

type FilterKey = 'todos' | OrderStatus;

export function CocinaBoard(): JSX.Element {
  const [orders, setOrders] = useState<KitchenOrder[]>(initialOrders);
  const [filter, setFilter] = useState<FilterKey>('todos');
  const [toast, setToast] = useState<string | null>(null);

  const counts = useMemo(() => {
    const base: Record<FilterKey, number> = { todos: orders.length, espera: 0, cocina: 0, listo: 0, entregado: 0, pagado: 0 };
    for (const order of orders) base[order.estado] += 1;
    return base;
  }, [orders]);

  const activeCount = counts.espera + counts.cocina;
  const visibleColumns = filter === 'todos' ? columns : columns.filter((column) => column.id === filter);

  function handleAdvance(idPedido: number, nextStatus: OrderStatus): void {
    setOrders((current) => current.map((order) => (order.id_pedido === idPedido ? { ...order, estado: nextStatus } : order)));
    const target = columns.find((column) => column.id === nextStatus);
    setToast(`Pedido #${idPedido} -> ${target?.label ?? 'actualizado'}`);
    window.setTimeout(() => setToast(null), 2200);
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
        <button type="button" className="flex items-center gap-2 rounded-sm border border-[rgba(31,26,20,0.15)] bg-cream-surface px-4 py-2.5 text-[13.5px] font-semibold text-ink-700">
          <HashIcon size={14} />
          Todas las mesas
        </button>
      </section>

      <div className="mb-6 flex flex-wrap gap-2.5">
        <button
          type="button"
          className={`flex items-center gap-2 rounded-full border px-4 py-2.5 text-[13.5px] font-semibold transition ${filter === 'todos' ? 'border-coral bg-coral text-white shadow-[0_8px_20px_-8px_rgba(233,75,51,0.5)]' : 'border-[rgba(31,26,20,0.08)] bg-cream-surface text-ink-500'}`}
          onClick={() => setFilter('todos')}
        >
          Todos <span className={filter === 'todos' ? 'text-white/75' : 'text-ink-400'}>({counts.todos})</span>
        </button>
        {columns.map((column) => (
          <button
            key={column.id}
            type="button"
            className={`flex items-center gap-2 rounded-full border px-4 py-2.5 text-[13.5px] font-semibold transition ${filter === column.id ? 'border-coral bg-coral text-white shadow-[0_8px_20px_-8px_rgba(233,75,51,0.5)]' : 'border-[rgba(31,26,20,0.08)] bg-cream-surface text-ink-500'}`}
            onClick={() => setFilter(column.id)}
          >
            {column.label} <span className={filter === column.id ? 'text-white/75' : 'text-ink-400'}>({counts[column.id]})</span>
          </button>
        ))}
      </div>

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
          />
        ))}
      </section>

      {toast ? (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-ink-900 px-5 py-3 text-[13.5px] font-semibold text-cream-bg shadow-toast">
          {toast}
        </div>
      ) : null}
    </main>
  );
}
