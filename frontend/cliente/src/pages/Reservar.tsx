import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { crearReserva, getDisponibilidadReservas, getMesas } from '@/api/cliente';
import { getErrorDetail } from '@/api/errors';
import { useAuth } from '@/auth/useAuth';
import { CalendarIcon, CheckIcon, ClockIcon, TableIcon, UsersIcon } from '@/components/icons';
import { ErrorState } from '@/components/ui/ErrorState';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { Link, useNavigate } from 'react-router-dom';
import type { MesaEstado } from '@/types';

const times = ['12:00', '12:30', '13:00', '13:30', '14:00', '19:00', '19:30', '20:00', '20:30', '21:00'];

const mesaStateLabel: Record<MesaEstado, string> = {
  libre: 'Libre',
  ocupada: 'Ocupada',
  reservada: 'Reservada',
  limpieza: 'En limpieza',
  lista: 'Lista para servir',
};

export function Reservar({ onToast }: { onToast: (message: string) => void }): JSX.Element {
  const { isAuthenticated, isGuest } = useAuth();
  const navigate = useNavigate();
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Lima' }).format(new Date());
  const [date, setDate] = useState(today);
  const [time, setTime] = useState('20:00');
  const [people, setPeople] = useState(2);
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reservasQuery = useQuery({
    queryKey: ['cliente', 'reservas', 'disponibilidad', date],
    queryFn: () => getDisponibilidadReservas(date),
    enabled: isAuthenticated && !isGuest,
    refetchInterval: 15000,
  });
  const mesasQuery = useQuery({
    queryKey: ['cliente', 'mesas'],
    queryFn: getMesas,
    enabled: isAuthenticated && !isGuest,
    refetchInterval: 10000,
  });
  const occupiedTables = useMemo(() => {
    const selectedDate = new Date(`${date}T${time}:00`);
    return new Set((reservasQuery.data ?? [])
      .filter((reserva) => Math.abs(new Date(reserva.hora_reserva).getTime() - selectedDate.getTime()) < 120 * 60 * 1000)
      .map((reserva) => reserva.id_mesa));
  }, [date, reservasQuery.data, time]);

  const tableAvailability = useMemo(() => {
    const selectedDate = new Date(`${date}T${time}:00`);
    const isNearCurrentTime = Math.abs(selectedDate.getTime() - Date.now()) < 120 * 60 * 1000;
    const result = new Map<number, string | null>();

    for (const mesa of mesasQuery.data ?? []) {
      let unavailableReason: string | null = null;
      if (occupiedTables.has(mesa.id_mesa)) unavailableReason = 'Reservada en ese horario';
      else if (mesa.capacidad < people) unavailableReason = `Maximo ${mesa.capacidad} personas`;
      else if (isNearCurrentTime && mesa.estado !== 'libre') unavailableReason = mesaStateLabel[mesa.estado];
      result.set(mesa.id_mesa, unavailableReason);
    }
    return result;
  }, [date, mesasQuery.data, occupiedTables, people, time]);

  useEffect(() => {
    const currentIsAvailable = selectedTable !== null && tableAvailability.get(selectedTable) === null;
    if (currentIsAvailable) return;
    const firstAvailable = (mesasQuery.data ?? []).find((mesa) => tableAvailability.get(mesa.id_mesa) === null);
    setSelectedTable(firstAvailable?.id_mesa ?? null);
  }, [mesasQuery.data, selectedTable, tableAvailability]);

  if (!isAuthenticated || isGuest) {
    return (
      <div className="grid min-h-[60dvh] place-items-center px-3 text-center">
        <div>
          <CalendarIcon className="mx-auto text-coral-600" size={34} />
          <h1 className="mt-4 font-serif text-3xl font-semibold">Reserva con tu cuenta</h1>
          <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-ink-500">La cuenta protege tu QR de reserva y te permite consultarla nuevamente.</p>
          <Link to="/registro" className="mt-5 inline-flex min-h-12 items-center rounded-md bg-coral px-5 text-sm font-semibold text-white">Crear cuenta</Link>
          <Link to="/login" className="mt-2 block min-h-11 py-3 text-sm font-semibold text-coral-600">Ya tengo cuenta</Link>
        </div>
      </div>
    );
  }

  async function handleReserve(): Promise<void> {
    if (selectedTable === null) {
      setError('No hay una mesa disponible para esa cantidad de personas y horario.');
      return;
    }
    setError(null);
    setIsSaving(true);
    try {
      const reserva = await crearReserva({
        id_mesa: selectedTable,
        hora_reserva: `${date}T${time}:00`,
        num_personas: people,
        notas: 'Reserva creada desde App Cliente',
      });
      await reservasQuery.refetch();
      onToast('Reserva confirmada');
      const token = reserva.qr_url.split('/').filter(Boolean).at(-1);
      navigate(token ? `/reservas/${token}` : '/reservar');
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
          <span className="text-xs text-ink-400">{reservasQuery.isFetching || mesasQuery.isFetching ? 'Actualizando...' : `${mesasQuery.data?.length ?? 0} mesas`}</span>
        </div>
        {reservasQuery.isError || mesasQuery.isError ? (
          <ErrorState
            message={getErrorDetail(reservasQuery.error ?? mesasQuery.error, 'No se pudo consultar la disponibilidad de mesas.')}
            onRetry={() => {
              void reservasQuery.refetch();
              void mesasQuery.refetch();
            }}
          />
        ) : null}

        {mesasQuery.isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }, (_, index) => <CardSkeleton key={index} />)}
          </div>
        ) : null}

        {!mesasQuery.isLoading && !mesasQuery.isError ? <div className="grid grid-cols-2 gap-3">
          {(mesasQuery.data ?? []).map((table) => {
            const unavailableReason = tableAvailability.get(table.id_mesa) ?? null;
            const busy = unavailableReason !== null;
            const selected = selectedTable === table.id_mesa;
            return (
              <button key={table.id_mesa} type="button" disabled={busy} className={`min-h-[112px] rounded-xl border p-3 text-left shadow-soft ${selected ? 'border-coral bg-coral-50' : 'border-[rgba(31,26,20,0.08)] bg-cream-surface'} ${busy ? 'opacity-45' : ''}`} onClick={() => setSelectedTable(table.id_mesa)}>
                <div className="flex items-center justify-between">
                  <span className="font-serif text-2xl font-bold">#{table.numero}</span>
                  <TableIcon size={18} className={selected ? 'text-coral-600' : 'text-ink-400'} />
                </div>
                <div className="mt-2 text-xs capitalize text-ink-500">{table.zona}</div>
                <div className="mt-1 text-xs text-ink-500">{table.capacidad} personas</div>
                <div className="mt-1 text-[11px] font-semibold text-ink-400">Ahora: {mesaStateLabel[table.estado]}</div>
                <div className={`mt-3 inline-flex rounded-full px-2 py-1 text-[11px] font-bold ${busy ? 'bg-sun-50 text-sun-600' : 'bg-mint-50 text-mint-600'}`}>
                  {unavailableReason ?? 'Disponible para reservar'}
                </div>
              </button>
            );
          })}
        </div> : null}
      </section>

      {error ? <div className="rounded-md bg-coral-50 px-4 py-3 text-sm text-coral-600">{error}</div> : null}

      <button type="button" disabled={isSaving || selectedTable === null} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-coral px-4 text-sm font-semibold text-white shadow-[0_8px_20px_-8px_rgba(233,75,51,0.5)] disabled:opacity-60" onClick={() => void handleReserve()}>
        <CheckIcon size={16} />
        {isSaving ? 'Confirmando...' : 'Confirmar reserva'}
      </button>
    </div>
  );
}
