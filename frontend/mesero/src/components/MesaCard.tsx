import clsx from 'clsx';
import { Flame, Users, Utensils } from 'lucide-react';

import type { Mesa, MesaEstado, ZonaMesa } from '@/types/api';

interface MesaCardProps {
  mesa: Mesa;
  onOpen?: (mesa: Mesa) => void;
}

const statusLabels: Record<MesaEstado, string> = {
  libre: 'Libre',
  ocupada: 'Activa',
  reservada: 'Reserva',
  lista: 'Plato listo',
  limpieza: 'Limpieza',
};

const zoneLabels: Record<ZonaMesa, string> = {
  salon: 'Salon',
  terraza: 'Terraza',
  barra: 'Barra',
  privado: 'Privado',
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function stateClasses(estado: MesaEstado): string {
  if (estado === 'ocupada') return 'border-terracotta-100 bg-terracotta-50';
  if (estado === 'lista') return 'border-saffron-500/50 bg-saffron-50';
  return 'border-[rgba(31,26,20,0.08)] bg-white';
}

function statusClasses(estado: MesaEstado): string {
  if (estado === 'ocupada') return 'bg-terracotta-100 text-terracotta-600';
  if (estado === 'lista') return 'bg-saffron-100 text-saffron-600';
  if (estado === 'libre') return 'bg-sage-50 text-sage-600';
  return 'bg-cream-100 text-ink-500';
}

export function MesaCard({ mesa, onOpen }: MesaCardProps): JSX.Element {
  const pedido = mesa.pedido_activo;
  const canOpen = (mesa.estado === 'ocupada' || mesa.estado === 'lista') && Boolean(onOpen);
  const isAvailable = mesa.estado === 'libre';
  const alertCount = pedido?.alerta ?? (mesa.estado === 'lista' ? 1 : 0);

  return (
    <button
      type="button"
      disabled={!canOpen}
      className={clsx(
        'relative flex min-h-[136px] w-full flex-col gap-2 rounded-lg border-[1.5px] p-3.5 text-left transition active:scale-[0.97] disabled:cursor-default disabled:opacity-100',
        stateClasses(mesa.estado),
        mesa.estado === 'lista' && 'animate-[count-in_500ms_ease-out]',
      )}
      onClick={() => onOpen?.(mesa)}
    >
      {alertCount > 0 ? (
        <span className="absolute -right-1.5 -top-1.5 grid h-6 w-6 place-items-center rounded-full border-2 border-white bg-terracotta-500 text-[11px] font-bold text-white shadow-md-soft" aria-label="Requiere atencion">
          !
        </span>
      ) : null}

      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="whitespace-nowrap font-serif text-[21px] font-semibold leading-none text-ink-900">Mesa {mesa.numero}</div>
          <div className="mt-1 truncate text-[10px] font-semibold uppercase tracking-[0.06em] text-ink-400">
            {mesa.zona ? zoneLabels[mesa.zona] : 'Sin zona'}
          </div>
        </div>
        <span className={clsx(
          'inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[10.5px] font-semibold',
          (mesa.estado === 'reservada' || mesa.estado === 'limpieza') && 'px-1.5 text-[9.5px]',
          statusClasses(mesa.estado),
        )}>
          <span className={clsx(
            'h-1.5 w-1.5 rounded-full',
            mesa.estado === 'ocupada' && 'bg-terracotta-500',
            mesa.estado === 'lista' && 'bg-saffron-500',
            mesa.estado === 'libre' && 'bg-sage-500',
            (mesa.estado === 'reservada' || mesa.estado === 'limpieza') && 'bg-ink-300',
          )} />
          {statusLabels[mesa.estado]}
        </span>
      </div>

      {isAvailable || mesa.estado === 'reservada' || mesa.estado === 'limpieza' ? (
        <div className="flex flex-1 items-center justify-center gap-1.5 text-[11.5px] text-ink-400">
          <Users aria-hidden="true" size={14} strokeWidth={1.8} />
          {mesa.capacidad} lugares
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 text-[11.5px] text-ink-500">
            <span className="inline-flex items-center gap-1"><Users aria-hidden="true" size={13} />{pedido?.comensales ?? 0}/{mesa.capacidad}</span>
            <span className="inline-flex items-center gap-1"><Utensils aria-hidden="true" size={13} />{pedido?.items_count ?? 0} platos</span>
          </div>
          <div className="flex items-center gap-1.5 truncate text-[11px] text-ink-500">
            <Flame aria-hidden="true" size={13} />
            {pedido?.progreso ?? (mesa.estado === 'lista' ? 'Plato listo en pase' : 'Pedido activo')}
          </div>
          <div className="mt-auto flex items-center justify-between border-t border-dashed border-[rgba(31,26,20,0.08)] pt-2">
            <div className="font-serif text-[16px] font-semibold text-terracotta-600 tnum">{formatCurrency(pedido?.total ?? 0)}</div>
            <div className="text-[10.5px] text-ink-500 tnum">{pedido ? `${pedido.minutos} min` : '-- min'}</div>
          </div>
        </>
      )}
    </button>
  );
}
