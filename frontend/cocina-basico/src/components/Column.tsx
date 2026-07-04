import clsx from 'clsx';

import { EmptyIcon } from '@/components/icons';
import { OrderCard } from '@/components/OrderCard';
import type { BoardColumn, KitchenOrder, OrderStatus } from '@/types';

interface ColumnProps {
  column: BoardColumn;
  orders: KitchenOrder[];
  onAdvance: (idPedido: number, nextStatus: OrderStatus) => void;
}

const dotClasses: Record<BoardColumn['accent'], string> = {
  sun: 'bg-sun',
  coral: 'bg-coral',
  mint: 'bg-mint',
  sky: 'bg-sky',
  plum: 'bg-plum',
};

export function Column({ column, orders, onAdvance }: ColumnProps): JSX.Element {
  return (
    <section className="flex min-h-[420px] flex-col overflow-hidden rounded-lg border border-[rgba(31,26,20,0.08)] bg-cream-bg2">
      <header className="flex items-center gap-2 border-b border-[rgba(31,26,20,0.08)] bg-cream-surface px-4 py-3.5">
        <span className={clsx('h-[9px] w-[9px] rounded-full', dotClasses[column.accent])} />
        <h2 className="flex-1 text-[14.5px] font-bold text-ink-900">{column.label}</h2>
        <span className="grid h-6 min-w-[26px] place-items-center rounded-full border border-[rgba(31,26,20,0.08)] bg-cream-bg2 px-2 font-mono text-xs font-bold text-ink-500 tnum">
          {orders.length}
        </span>
      </header>

      <div className="scrollbar-thin flex flex-1 flex-col gap-3 overflow-y-auto p-3">
        {orders.length === 0 ? (
          <div className="grid flex-1 place-items-center px-4 py-10 text-center text-[13px] text-ink-400">
            <div>
              <div className="mb-2 flex justify-center opacity-50">
                <EmptyIcon size={26} />
              </div>
              Sin pedidos
            </div>
          </div>
        ) : (
          orders.map((order) => (
            <OrderCard key={order.id_pedido} order={order} column={column} onAdvance={onAdvance} />
          ))
        )}
      </div>
    </section>
  );
}
