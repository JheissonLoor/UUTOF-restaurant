import clsx from 'clsx';
import { Check } from 'lucide-react';

import type { PedidoItem } from '@/types/api';

interface OrderItemProps {
  item: PedidoItem;
  isDelivering: boolean;
  onDeliver: (item: PedidoItem) => void;
}

const stateLabels: Record<PedidoItem['estado_item'], string> = {
  en_cocina: 'En cocina',
  ready: 'Listo en pase',
  delivered: 'Entregado',
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

export function OrderItem({ item, isDelivering, onDeliver }: OrderItemProps): JSX.Element {
  const isReady = item.estado_item === 'ready';

  return (
    <article className={clsx(
      'grid grid-cols-[30px_1fr_auto] gap-3 border-b border-[rgba(31,26,20,0.08)] px-3.5 py-3 last:border-b-0',
      isReady && 'bg-sage-50/70',
    )}>
      <div className="grid h-7 w-7 place-items-center rounded-sm bg-terracotta-50 text-xs font-bold text-terracotta-600 tnum">×{item.qty}</div>
      <div className="min-w-0">
        <div className="text-[13.5px] font-medium leading-snug text-ink-900">{item.nombre}</div>
        {item.nota ? <div className="mt-0.5 text-[11px] italic text-ink-500">{item.nota}</div> : null}
        {isReady ? (
          <button
            type="button"
            disabled={isDelivering}
            className="mt-2 inline-flex min-h-11 items-center gap-1.5 rounded-full bg-sage-500 px-3 text-[11px] font-semibold text-white transition active:scale-[0.97] disabled:opacity-60"
            onClick={() => onDeliver(item)}
          >
            <Check aria-hidden="true" size={13} strokeWidth={2.5} />
            {isDelivering ? 'Marcando...' : 'Marcar entregado'}
          </button>
        ) : (
          <span className={clsx(
            'mt-1.5 inline-flex rounded-full px-2 py-1 text-[10px] font-semibold',
            item.estado_item === 'en_cocina' && 'bg-terracotta-50 text-terracotta-600',
            item.estado_item === 'delivered' && 'bg-cream-100 text-ink-500',
          )}>
            {stateLabels[item.estado_item]}
          </span>
        )}
      </div>
      <div className="whitespace-nowrap font-serif text-sm font-semibold text-ink-900 tnum">{formatCurrency(item.qty * item.price)}</div>
    </article>
  );
}
