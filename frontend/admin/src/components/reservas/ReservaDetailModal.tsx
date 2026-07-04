import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarDays, Clock3, NotebookText, Table2, Users, X } from 'lucide-react';
import { useEffect, useRef } from 'react';

import { Button } from '@/components/ui/Button';
import type { Reserva } from '@/types/api';

interface ReservaDetailModalProps {
  reserva: Reserva;
  mesaNumero: number | null;
  onClose: () => void;
}

export function ReservaDetailModal({ reserva, mesaNumero, onClose }: ReservaDetailModalProps): JSX.Element {
  const modalRef = useRef<HTMLElement | null>(null);
  const fecha = parseISO(reserva.hora_reserva);

  useEffect(() => {
    modalRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink-900/35 px-4 py-6" role="presentation">
      <section
        ref={modalRef}
        aria-labelledby="reserva-modal-title"
        aria-modal="true"
        className="w-full max-w-[500px] rounded-lg border border-[rgba(42,30,20,0.08)] bg-white p-5 text-ink-900 shadow-lg-soft animate-[count-in_220ms_cubic-bezier(.18,.9,.32,1.18)]"
        role="dialog"
        tabIndex={-1}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="reserva-modal-title" className="font-serif text-h1">
              Reserva #{reserva.id_reserva}
            </h2>
            <p className="mt-1 text-sm text-ink-500">{reserva.nombre_cliente}</p>
          </div>
          <button
            type="button"
            className="grid h-9 w-9 place-items-center rounded-md text-ink-500 transition hover:bg-cream-100 hover:text-ink-900"
            aria-label="Cerrar"
            onClick={onClose}
          >
            <X aria-hidden="true" size={18} strokeWidth={1.8} />
          </button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-md border border-[rgba(42,30,20,0.08)] bg-cream-50 p-4">
            <span className="text-label uppercase text-ink-500">Fecha</span>
            <span className="mt-2 flex items-center gap-2 text-sm font-semibold text-ink-900">
              <CalendarDays aria-hidden="true" size={15} strokeWidth={1.8} />
              {format(fecha, "EEEE d 'de' MMMM", { locale: es })}
            </span>
          </div>
          <div className="rounded-md border border-[rgba(42,30,20,0.08)] bg-cream-50 p-4">
            <span className="text-label uppercase text-ink-500">Hora</span>
            <span className="mt-2 flex items-center gap-2 text-sm font-semibold text-ink-900 tnum">
              <Clock3 aria-hidden="true" size={15} strokeWidth={1.8} />
              {format(fecha, 'HH:mm', { locale: es })}
            </span>
          </div>
          <div className="rounded-md border border-[rgba(42,30,20,0.08)] bg-cream-50 p-4">
            <span className="text-label uppercase text-ink-500">Mesa</span>
            <span className="mt-2 flex items-center gap-2 text-sm font-semibold text-ink-900 tnum">
              <Table2 aria-hidden="true" size={15} strokeWidth={1.8} />
              Mesa {mesaNumero ?? reserva.id_mesa}
            </span>
          </div>
          <div className="rounded-md border border-[rgba(42,30,20,0.08)] bg-cream-50 p-4">
            <span className="text-label uppercase text-ink-500">Comensales</span>
            <span className="mt-2 flex items-center gap-2 text-sm font-semibold text-ink-900 tnum">
              <Users aria-hidden="true" size={15} strokeWidth={1.8} />
              {reserva.num_personas}
            </span>
          </div>
        </div>

        <div className="mt-4 rounded-md border border-[rgba(42,30,20,0.08)] p-4">
          <div className="flex items-center gap-2">
            <NotebookText aria-hidden="true" className="text-saffron-600" size={17} strokeWidth={1.8} />
            <span className="text-label uppercase text-ink-500">Notas especiales</span>
          </div>
          <p className="mt-2 text-sm text-ink-700">{reserva.notas_especiales ?? 'Sin notas especiales.'}</p>
        </div>

        <div className="mt-6 flex justify-end border-t border-dashed border-[rgba(42,30,20,0.08)] pt-5">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </section>
    </div>
  );
}
