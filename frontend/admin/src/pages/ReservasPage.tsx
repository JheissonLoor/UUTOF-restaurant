import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import {
  addDays,
  addWeeks,
  format,
  formatISO,
  isSameDay,
  parseISO,
  startOfWeek,
  subWeeks,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarDays, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { useMemo, useState } from 'react';

import { getErrorDetail } from '@/api/errors';
import { getMesas } from '@/api/mesas';
import { getReservasSemana } from '@/api/reservas';
import { ReservaCard } from '@/components/reservas/ReservaCard';
import { ReservaDetailModal } from '@/components/reservas/ReservaDetailModal';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import type { Reserva } from '@/types/api';

interface DayReservations {
  date: Date;
  dateKey: string;
  reservas: Reserva[];
}

function ReservasSkeleton(): JSX.Element {
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Skeleton className="h-10 w-[240px]" />
          <Skeleton className="mt-2 h-5 w-[320px]" />
        </div>
        <Skeleton className="h-10 w-[310px]" />
      </div>
      <Skeleton className="h-[620px] rounded-lg" />
    </div>
  );
}

function getWeekTitle(weekStart: Date): string {
  const weekEnd = addDays(weekStart, 6);
  const sameMonth = weekStart.getMonth() === weekEnd.getMonth();

  if (sameMonth) {
    return `${format(weekStart, 'd', { locale: es })} - ${format(weekEnd, 'd MMMM yyyy', { locale: es })}`;
  }

  return `${format(weekStart, 'd MMM', { locale: es })} - ${format(weekEnd, 'd MMM yyyy', { locale: es })}`;
}

export function ReservasPage(): JSX.Element {
  const { showToast } = useToast();
  const today = new Date();
  const [weekStart, setWeekStart] = useState(() => startOfWeek(today, { weekStartsOn: 1 }));
  const [selectedReserva, setSelectedReserva] = useState<Reserva | null>(null);

  const weekKey = formatISO(weekStart, { representation: 'date' });

  const reservasQuery = useQuery({
    queryKey: ['reservas', weekKey],
    queryFn: () => getReservasSemana(weekStart),
  });

  const mesasQuery = useQuery({
    queryKey: ['mesas'],
    queryFn: getMesas,
  });

  const mesasById = useMemo(() => {
    return new Map((mesasQuery.data ?? []).map((mesa) => [mesa.id_mesa, mesa.numero]));
  }, [mesasQuery.data]);

  const days = useMemo<DayReservations[]>(() => {
    const reservas = reservasQuery.data ?? [];
    const reservasByDay = new Map<string, Reserva[]>();

    for (const reserva of reservas) {
      const dateKey = formatISO(parseISO(reserva.hora_reserva), { representation: 'date' });
      const current = reservasByDay.get(dateKey) ?? [];
      current.push(reserva);
      reservasByDay.set(dateKey, current);
    }

    return Array.from({ length: 7 }, (_, index) => {
      const date = addDays(weekStart, index);
      const dateKey = formatISO(date, { representation: 'date' });
      return {
        date,
        dateKey,
        reservas: reservasByDay.get(dateKey) ?? [],
      };
    });
  }, [reservasQuery.data, weekStart]);

  async function handleRefresh(): Promise<void> {
    await Promise.all([reservasQuery.refetch(), mesasQuery.refetch()]);
    showToast({ variant: 'success', title: 'Agenda actualizada', description: 'Las reservas están al día.' });
  }

  if (reservasQuery.isLoading || mesasQuery.isLoading) {
    return <ReservasSkeleton />;
  }

  if (reservasQuery.isError || mesasQuery.isError) {
    return (
      <ErrorState
        title="No se pudieron cargar las reservas"
        message={getErrorDetail(reservasQuery.error ?? mesasQuery.error, 'No pudimos consultar la agenda semanal.')}
        onRetry={() => {
          void reservasQuery.refetch();
          void mesasQuery.refetch();
        }}
      />
    );
  }

  const totalReservas = reservasQuery.data?.length ?? 0;
  const selectedMesaNumero = selectedReserva ? (mesasById.get(selectedReserva.id_mesa) ?? null) : null;

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-md bg-saffron-100 text-saffron-600">
              <CalendarDays aria-hidden="true" size={20} strokeWidth={1.8} />
            </div>
            <h1 className="font-serif text-[36px] font-semibold leading-tight text-ink-900">Reservas</h1>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-ink-500">
            <span>{totalReservas} reservas esta semana</span>
            <span aria-hidden="true">·</span>
            <span className="capitalize">{getWeekTitle(weekStart)}</span>
            {reservasQuery.isFetching || mesasQuery.isFetching ? (
              <>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1.5 text-sage-500">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-sage-500" />
                  Actualizando
                </span>
              </>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="icon" aria-label="Semana anterior" title="Semana anterior" onClick={() => setWeekStart((current) => subWeeks(current, 1))}>
            <ChevronLeft aria-hidden="true" size={17} strokeWidth={1.8} />
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}>
            Hoy
          </Button>
          <Button type="button" variant="icon" aria-label="Semana siguiente" title="Semana siguiente" onClick={() => setWeekStart((current) => addWeeks(current, 1))}>
            <ChevronRight aria-hidden="true" size={17} strokeWidth={1.8} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            loading={reservasQuery.isFetching || mesasQuery.isFetching}
            onClick={() => {
              void handleRefresh();
            }}
          >
            <RefreshCw aria-hidden="true" size={15} strokeWidth={1.8} />
            Actualizar
          </Button>
        </div>
      </div>

      <section className="overflow-hidden rounded-lg border border-[rgba(42,30,20,0.08)] bg-white shadow-sm-soft">
        <div className="scrollbar-none overflow-x-auto">
          <div className="min-w-[1050px]">
            <div className="grid grid-cols-7 border-b border-[rgba(42,30,20,0.08)] bg-cream-50">
              {days.map((day) => {
                const isToday = isSameDay(day.date, today);
                return (
                  <div
                    key={day.dateKey}
                    className={clsx(
                      'border-r border-[rgba(42,30,20,0.08)] px-4 py-3 last:border-r-0',
                      isToday ? 'bg-terracotta-50' : null,
                    )}
                  >
                    <div className="text-label uppercase text-ink-500">{format(day.date, 'EEEE', { locale: es })}</div>
                    <div className={clsx('mt-1 font-serif text-[22px] font-semibold leading-none tnum', isToday ? 'text-terracotta-600' : 'text-ink-900')}>
                      {format(day.date, 'd', { locale: es })}
                    </div>
                  </div>
                );
              })}
            </div>

            {totalReservas === 0 ? (
              <div className="p-5">
                <EmptyState
                  title="Sin reservas esta semana"
                  description="No hay reservaciones registradas para los siete días seleccionados."
                />
              </div>
            ) : (
              <div className="grid min-h-[540px] grid-cols-7">
                {days.map((day) => (
                  <div key={day.dateKey} className="border-r border-[rgba(42,30,20,0.08)] p-3 last:border-r-0">
                    {day.reservas.length === 0 ? (
                      <div className="rounded-md border border-dashed border-[rgba(42,30,20,0.14)] bg-cream-50 px-3 py-5 text-center text-xs text-ink-400">
                        Sin reservas
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {day.reservas.map((reserva) => (
                          <ReservaCard
                            key={reserva.id_reserva}
                            reserva={reserva}
                            mesaNumero={mesasById.get(reserva.id_mesa) ?? null}
                            onOpen={setSelectedReserva}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {selectedReserva ? (
        <ReservaDetailModal reserva={selectedReserva} mesaNumero={selectedMesaNumero} onClose={() => setSelectedReserva(null)} />
      ) : null}
    </>
  );
}
