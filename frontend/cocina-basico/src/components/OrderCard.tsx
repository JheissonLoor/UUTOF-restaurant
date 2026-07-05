import clsx from 'clsx';

import { ClockIcon, MoveIcon, TableIcon, UserIcon } from '@/components/icons';
import { formatCurrency } from '@/lib/format';
import type { BoardColumn, KitchenOrder, PedidoTransition } from '@/types';

interface OrderCardProps {
  order: KitchenOrder;
  column: BoardColumn;
  onAdvance: (idPedido: number, transition: PedidoTransition) => void;
  isAdvancing?: boolean;
}

const badgeClasses: Record<BoardColumn['accent'], string> = {
  sun: 'bg-sun-50 text-sun-600',
  coral: 'bg-coral-50 text-coral-600',
  mint: 'bg-mint-50 text-mint-600',
  sky: 'bg-sky-50 text-sky-600',
  plum: 'bg-plum-50 text-plum',
};

const actionClasses: Record<NonNullable<BoardColumn['actionTone']>, string> = {
  coral: 'bg-coral-50 text-coral-600 hover:bg-coral-100',
  mint: 'bg-mint-50 text-mint-600 hover:bg-mint-50/80',
  sky: 'bg-sky-50 text-sky-600 hover:bg-sky-50/80',
};

export function OrderCard({ order, column, onAdvance, isAdvancing = false }: OrderCardProps): JSX.Element {
  const isHot = order.minutos > 20 && order.estado !== 'entregado' && order.estado !== 'pagado';

  return (
    <article className="rounded-md border border-[rgba(31,26,20,0.08)] bg-cream-surface p-3.5 shadow-soft">
      <div className="mb-2.5 flex items-center gap-2.5">
        <span className="font-serif text-[19px] font-bold text-ink-900">#{order.id_pedido}</span>
        <span className={clsx('ml-auto rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.02em]', badgeClasses[column.accent])}>
          {column.badgeLabel}
        </span>
      </div>

      <div className="flex flex-col gap-1.5 text-[12.5px] text-ink-500">
        <div className="flex items-center gap-2">
          <UserIcon size={14} />
          <b className="font-semibold text-ink-700">{order.cliente}</b>
        </div>
        <div className="flex items-center gap-2">
          <TableIcon size={14} />
          Mesa {order.mesa}
        </div>
      </div>

      <div className="my-2.5 flex flex-col gap-1.5">
        {order.items.map((item, index) => (
          <div key={`${order.id_pedido}-${index}`} className="flex items-baseline gap-2 text-[12.5px]">
            <span className="shrink-0 rounded-[5px] border border-[rgba(31,26,20,0.08)] bg-cream-bg2 px-1.5 py-0.5 font-mono text-[10.5px] font-semibold text-ink-500">
              {item.qty}x
            </span>
            <span className="text-ink-700">{item.nombre}</span>
            {item.nota ? <span className="text-[11.5px] italic text-coral-600">! {item.nota}</span> : null}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-dashed border-[rgba(31,26,20,0.15)] pt-2.5">
        <span className={clsx('flex items-center gap-1 font-mono text-[11.5px] text-ink-400 tnum', isHot && 'font-semibold text-coral-600')}>
          <ClockIcon size={11} />
          hace {order.minutos} min
        </span>
        <span className="font-serif text-[16px] font-bold text-ink-900">{formatCurrency(order.total)}</span>
      </div>

      {column.actionLabel && column.transition ? (
        <button
          type="button"
          disabled={isAdvancing}
          className={clsx(
            'mt-2.5 flex w-full items-center justify-center gap-2 rounded-sm px-3 py-2.5 text-[13px] font-semibold transition disabled:cursor-wait disabled:opacity-65',
            actionClasses[column.actionTone ?? 'coral'],
          )}
          onClick={() => onAdvance(order.id_pedido, column.transition)}
        >
          <MoveIcon size={14} />
          {isAdvancing ? 'Actualizando...' : column.actionLabel}
        </button>
      ) : null}
    </article>
  );
}
