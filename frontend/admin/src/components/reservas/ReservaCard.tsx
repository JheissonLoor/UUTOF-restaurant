import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Clock3, Table2, Users } from 'lucide-react';

import type { Reserva } from '@/types/api';

interface ReservaCardProps {
  reserva: Reserva;
  mesaNumero: number | null;
  onOpen: (reserva: Reserva) => void;
}

export function ReservaCard({ reserva, mesaNumero, onOpen }: ReservaCardProps): JSX.Element {
  const hora = format(parseISO(reserva.hora_reserva), 'HH:mm', { locale: es });

  return (
    <button
      type="button"
      className="w-full rounded-md border border-saffron-500/60 bg-saffron-100/70 p-3 text-left shadow-sm-soft transition duration-150 hover:-translate-y-px hover:bg-saffron-100 hover:shadow-md-soft"
      aria-label={`Abrir reserva de ${reserva.nombre_cliente} a las ${hora}`}
      onClick={() => onOpen(reserva)}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-saffron-600 tnum">
          <Clock3 aria-hidden="true" size={13} strokeWidth={1.8} />
          {hora}
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-ink-500">
          <Table2 aria-hidden="true" size={12} strokeWidth={1.8} />
          Mesa {mesaNumero ?? reserva.id_mesa}
        </span>
      </div>
      <div className="mt-2 text-sm font-semibold text-ink-900">{reserva.nombre_cliente}</div>
      <div className="mt-1 inline-flex items-center gap-1.5 text-xs text-ink-500">
        <Users aria-hidden="true" size={13} strokeWidth={1.8} />
        {reserva.num_personas} personas
      </div>
    </button>
  );
}
