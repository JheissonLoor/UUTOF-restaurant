import { useState } from 'react';

import { EmptyState } from '@/components/ui/EmptyState';
import { BagIcon, ClockIcon } from '@/components/icons';
import { formatOrderFolio } from '@/lib/format';

export function Pedidos({ activePedidoId, onOpenMenu, onTrack }: { activePedidoId: number | null; onOpenMenu: () => void; onTrack: (idPedido: number) => void }): JSX.Element {
  const [filter, setFilter] = useState<'todos' | 'activos' | 'historial'>('todos');
  const hasActive = activePedidoId !== null;

  return (
    <div className="space-y-5" data-screen-label="06 Pedidos">
      <section>
        <h1 className="font-serif text-[32px] font-semibold leading-tight">Mis pedidos</h1>
        <p className="mt-1 text-sm text-ink-500">Sigue tus pedidos en tiempo real y consulta tu historial.</p>
      </section>

      <div className="flex gap-2">
        {(['todos', 'activos', 'historial'] as const).map((item) => (
          <button key={item} type="button" className={`min-h-11 rounded-full px-4 text-sm font-semibold capitalize ${filter === item ? 'bg-coral text-white' : 'bg-cream-surface text-ink-500'}`} onClick={() => setFilter(item)}>
            {item}
          </button>
        ))}
      </div>

      {hasActive && filter !== 'historial' ? (
        <article className="rounded-xl border border-[rgba(31,26,20,0.08)] bg-cream-surface p-4 shadow-soft">
          <div className="flex items-start gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-md bg-coral-50 text-coral-600">
              <BagIcon size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-serif text-xl font-semibold">{formatOrderFolio(activePedidoId)}</h2>
              <p className="mt-1 flex items-center gap-1 text-xs text-ink-500">
                <ClockIcon size={12} />
                En curso · seguimiento disponible
              </p>
            </div>
            <span className="rounded-full bg-mint-50 px-3 py-1 text-xs font-bold text-mint-600">Activo</span>
          </div>
          <button type="button" className="mt-4 min-h-11 w-full rounded-sm bg-coral px-4 text-sm font-semibold text-white" onClick={() => onTrack(activePedidoId)}>
            Seguir en vivo
          </button>
        </article>
      ) : null}

      {!hasActive || filter === 'historial' ? (
        <EmptyState
          title={filter === 'historial' ? 'Historial vacío' : 'Aún no tienes pedidos'}
          body="Cuando envíes un pedido aparecerá aquí con tracking y cuenta."
          action={<button type="button" className="min-h-11 rounded-sm bg-coral px-4 text-sm font-semibold text-white" onClick={onOpenMenu}>Ver menú</button>}
        />
      ) : null}
    </div>
  );
}
