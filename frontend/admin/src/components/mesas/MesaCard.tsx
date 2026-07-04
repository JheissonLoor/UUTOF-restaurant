import clsx from 'clsx';
import { Clock3, Table2, Users } from 'lucide-react';

import { mesaStatePresentation } from '@/components/mesas/mesaPresentation';
import { formatCurrency } from '@/lib/format';
import type { Mesa } from '@/types/api';

interface MesaCardProps {
  mesa: Mesa;
  onOpen: (mesa: Mesa) => void;
}

export function MesaCard({ mesa, onOpen }: MesaCardProps): JSX.Element {
  const state = mesaStatePresentation[mesa.estado];

  return (
    <button
      type="button"
      className={clsx(
        'group min-h-[220px] w-full rounded-lg border p-5 text-left shadow-sm-soft transition duration-200 hover:-translate-y-0.5 hover:shadow-md-soft',
        state.cardClasses,
      )}
      aria-label={`Abrir detalle de mesa ${mesa.numero}, estado ${state.label}`}
      onClick={() => onOpen(mesa)}
    >
      <div className="flex items-start justify-between gap-4">
        <div className={clsx('grid h-11 w-11 place-items-center rounded-md shadow-sm-soft', state.iconClasses)}>
          <Table2 aria-hidden="true" size={21} strokeWidth={1.8} />
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/75 px-2.5 py-1 text-xs font-medium text-ink-700 shadow-sm-soft">
          <span className={clsx('h-1.5 w-1.5 rounded-full', state.dotClasses)} />
          {state.label}
        </span>
      </div>

      <div className="mt-7">
        <span className="text-label uppercase text-ink-500">Mesa</span>
        <div className="mt-0.5 font-serif text-[40px] font-semibold leading-none text-ink-900 tnum">{mesa.numero}</div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[rgba(42,30,20,0.08)] pt-4 text-xs font-medium text-ink-700">
        <span className="inline-flex items-center gap-1.5">
          <Users aria-hidden="true" size={14} strokeWidth={1.8} />
          {mesa.capacidad} personas
        </span>
        {mesa.pedido_activo ? (
          <>
            <span className="inline-flex items-center gap-1.5">
              <Clock3 aria-hidden="true" size={14} strokeWidth={1.8} />
              {mesa.pedido_activo.tiempo_min} min
            </span>
            <span className="ml-auto font-semibold text-ink-900 tnum">{formatCurrency(mesa.pedido_activo.total)}</span>
          </>
        ) : null}
      </div>
    </button>
  );
}
