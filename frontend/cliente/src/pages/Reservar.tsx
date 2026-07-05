import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { crearReserva, getReservas } from '@/api/cliente';
import { getErrorDetail } from '@/api/errors';
import { CalendarIcon, CheckIcon, ClockIcon, TableIcon, UsersIcon } from '@/components/icons';

const tables = [
  { id_mesa: 1, numero: 1, capacidad: 2, zona: 'ventana' },
  { id_mesa: 2, numero: 2, capacidad: 4, zona: 'salon' },
  { id_mesa: 3, numero: 3, capacidad: 2, zona: 'ventana' },
  { id_mesa: 4, numero: 4, capacidad: 6, zona: 'salon' },
  { id_mesa: 5, numero: 5, capacidad: 4, zona: 'salon' },
  { id_mesa: 6, numero: 6, capacidad: 8, zona: 'terraza' },
  { id_mesa: 7, numero: 7, capacidad: 2, zona: 'barra' },
  { id_mesa: 8, numero: 8, capacidad: 4, zona: 'terraza' },
];

const times = ['12:00', '12:30', '13:00', '13:30', '14:00', '19:00', '19:30', '20:00', '20:30', '21:00'];

export function Reservar({ onToast }: { onToast: (message: string) => void }): JSX.Element {
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [time, setTime] = useState('20:00');
  const [people, setPeople] = useState(2);
  const [selectedTable, setSelectedTable] = useState(5);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reservasQuery = useQuery({ queryKey: ['cliente', 'reservas', date], queryFn: () => getReservas(date) });
  const occupiedTables = useMemo(() => new Set((reservasQuery.data ?? []).map((reserva) => reserva.id_mesa)), [reservasQuery.data]);

  async function handleReserve(): Promise<void> {
    setError(null);
    setIsSaving(true);
    try {
      await crearReserva({
        id_mesa: selectedTable,
        hora_reserva: `${date}T${time}:00`,
        num_personas: people,
        notas: 'Reserva creada desde App Cliente',
      });
      onToast('Reserva confirmada');
      void reservasQuery.refetch();
    } catch (reserveError) {
      setError(getErrorDetail(reserveError, 'No se pudo confirmar la reserva.'));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-5" data-screen-label="03 Reservar">
      <section>
        <h1 className="font-serif text-[32px] font-semibold leading-tight">Reservar mesa</h1>
        <p className="mt-1 text-sm text-ink-500">Elige fecha, hora y una mesa disponible.</p>
      </section>

      <section className="rounded-xl bg-cream-surface p-4 shadow-soft">
        <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.1em] text-ink-500">
          <CalendarIcon size={14} />
          Fecha
        </label>
        <input type="date" min={today} value={date} onChange={(event) => setDate(event.target.value)} className="h-12 w-full rounded-md border-[rgba(31,26,20,0.12)] bg-white text-sm focus:border-coral focus:ring-coral-50" />

        <div className="mt-4">
          <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.1em] text-ink-500">
            <ClockIcon size={14} />
            Hora
          </label>
          <div className="grid grid-cols-5 gap-2">
            {times.map((slot) => (
              <button key={slot} type="button" className={`min-h-11 rounded-sm text-xs font-bold ${time === slot ? 'bg-coral text-white' : 'bg-cream-bg2 text-ink-500'}`} onClick={() => setTime(slot)}>
                {slot}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.1em] text-ink-500">
            <UsersIcon size={14} />
            Personas
          </label>
          <div className="flex items-center justify-between rounded-md bg-cream-bg2 p-2">
            <button type="button" className="h-11 w-11 rounded-sm bg-cream-surface font-bold" onClick={() => setPeople((value) => Math.max(1, value - 1))}>-</button>
            <span className="font-serif text-2xl font-semibold">{people}</span>
            <button type="button" className="h-11 w-11 rounded-sm bg-coral font-bold text-white" onClick={() => setPeople((value) => Math.min(12, value + 1))}>+</button>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-serif text-2xl font-semibold">Plano del salón</h2>
          <span className="text-xs text-ink-400">{reservasQuery.isFetching ? 'Actualizando...' : 'Disponible'}</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {tables.map((table) => {
            const busy = occupiedTables.has(table.id_mesa);
            const selected = selectedTable === table.id_mesa;
            return (
              <button key={table.id_mesa} type="button" disabled={busy} className={`min-h-[112px] rounded-xl border p-3 text-left shadow-soft ${selected ? 'border-coral bg-coral-50' : 'border-[rgba(31,26,20,0.08)] bg-cream-surface'} ${busy ? 'opacity-45' : ''}`} onClick={() => setSelectedTable(table.id_mesa)}>
                <div className="flex items-center justify-between">
                  <span className="font-serif text-2xl font-bold">#{table.numero}</span>
                  <TableIcon size={18} className={selected ? 'text-coral-600' : 'text-ink-400'} />
                </div>
                <div className="mt-2 text-xs capitalize text-ink-500">{table.zona}</div>
                <div className="mt-1 text-xs text-ink-500">{table.capacidad} personas</div>
                <div className={`mt-3 inline-flex rounded-full px-2 py-1 text-[11px] font-bold ${busy ? 'bg-sun-50 text-sun-600' : 'bg-mint-50 text-mint-600'}`}>
                  {busy ? 'Reservada' : 'Disponible'}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {error ? <div className="rounded-md bg-coral-50 px-4 py-3 text-sm text-coral-600">{error}</div> : null}

      <button type="button" disabled={isSaving} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-coral px-4 text-sm font-semibold text-white shadow-[0_8px_20px_-8px_rgba(233,75,51,0.5)] disabled:opacity-60" onClick={() => void handleReserve()}>
        <CheckIcon size={16} />
        {isSaving ? 'Confirmando...' : 'Confirmar reserva'}
      </button>
    </div>
  );
}
