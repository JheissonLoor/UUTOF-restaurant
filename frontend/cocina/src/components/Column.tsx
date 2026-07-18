import clsx from 'clsx';

import { OrderCard } from '@/components/OrderCard';
import { EmptyState } from '@/components/ui/EmptyState';
import type { BoardColumn, KitchenOrder, PedidoTransition } from '@/types';

interface ColumnProps {
  column: BoardColumn;
  orders: KitchenOrder[];
  onAdvance: (idPedido: number, transition: PedidoTransition) => void;
  advancingId?: number | null;
}

const dotClasses: Record<BoardColumn['accent'], string> = {
  sun: 'bg-sun',
  coral: 'bg-coral',
  mint: 'bg-mint',
  sky: 'bg-sky',
  plum: 'bg-plum',
};

export function Column({ column, orders, onAdvance, advancingId = null }: ColumnProps): JSX.Element {
  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden">
      <header className="flex items-center gap-2 px-1 pb-3 pt-1">
        <span className={clsx('h-[9px] w-[9px] rounded-full', dotClasses[column.accent])} />
        <h2 className="flex-1 text-[14.5px] font-bold text-ink-900">{column.label}</h2>
        <span className="grid h-6 min-w-[26px] place-items-center rounded-full border border-[rgba(31,26,20,0.08)] bg-cream-bg2 px-2 font-mono text-xs font-bold text-ink-500 tnum">
          {orders.length}
        </span>
      </header>

      <div className="scrollbar-thin flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pr-1">
        {orders.length === 0 ? (
          <div className="flex min-h-[180px] flex-1 rounded-md border border-dashed border-[rgba(31,26,20,0.15)] bg-white/40">
            <EmptyState />
          </div>
        ) : (
          orders.map((order) => (
            <OrderCard key={order.id_pedido} order={order} column={column} onAdvance={onAdvance} isAdvancing={advancingId === order.id_pedido} />
          ))
        )}
      </div>
    </section>
  );
}
