import { useQuery } from '@tanstack/react-query';
import { format, subDays } from 'date-fns';
import { Banknote, CalendarDays, LineChart, ReceiptText, RefreshCw, TrendingUp } from 'lucide-react';
import { type FormEvent, useMemo, useState } from 'react';

import { getErrorDetail } from '@/api/errors';
import { getVentasReporte, type ReporteGranularidad } from '@/api/reportes';
import { ReportTrendChart } from '@/components/reportes/ReportTrendChart';
import { TopPlatillosReportChart } from '@/components/reportes/TopPlatillosReportChart';
import { Button } from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { StatCard } from '@/components/ui/StatCard';
import { useToast } from '@/components/ui/Toast';
import { formatCurrency, formatNumber } from '@/lib/format';

interface ReportFilters {
  from: string;
  to: string;
  granularidad: ReporteGranularidad;
}

const granularidades: Array<{ value: ReporteGranularidad; label: string }> = [
  { value: 'dia', label: 'Dia' },
  { value: 'semana', label: 'Semana' },
  { value: 'mes', label: 'Mes' },
];

function getDefaultFilters(): ReportFilters {
  const today = new Date();
  return {
    from: format(subDays(today, 29), 'yyyy-MM-dd'),
    to: format(today, 'yyyy-MM-dd'),
    granularidad: 'dia',
  };
}

function ReportesSkeleton(): JSX.Element {
  return (
    <div className="space-y-5">
      <div className="grid gap-5 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className="h-[152px] rounded-lg" />)}
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-[368px] rounded-lg" />)}
      </div>
    </div>
  );
}

export function ReportesPage(): JSX.Element {
  const { showToast } = useToast();
  const [draftFilters, setDraftFilters] = useState<ReportFilters>(getDefaultFilters);
  const [filters, setFilters] = useState<ReportFilters>(getDefaultFilters);

  const ventasQuery = useQuery({
    queryKey: ['reportes', 'ventas', filters],
    queryFn: () => getVentasReporte(filters),
  });

  const data = ventasQuery.data;
  const ingresosSeries = useMemo(
    () => data?.ingresos_por_periodo.map((item) => ({ periodo: item.periodo, valor: item.monto })) ?? [],
    [data],
  );
  const pedidosSeries = useMemo(
    () => data?.pedidos_por_periodo.map((item) => ({ periodo: item.periodo, valor: item.cantidad })) ?? [],
    [data],
  );
  const ticketSeries = useMemo(
    () => data?.ticket_promedio_por_periodo.map((item) => ({ periodo: item.periodo, valor: item.monto })) ?? [],
    [data],
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (draftFilters.from > draftFilters.to) {
      showToast({
        variant: 'warning',
        title: 'Rango invalido',
        description: 'La fecha inicial no puede ser posterior a la fecha final.',
      });
      return;
    }
    setFilters(draftFilters);
  }

  const rangeLabel = `${filters.from} al ${filters.to}`;

  return (
    <div className="reportes-print-root">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-md bg-sage-100 text-sage-500">
              <LineChart aria-hidden="true" size={20} strokeWidth={1.8} />
            </div>
            <h1 className="font-serif text-[36px] font-semibold leading-tight text-ink-900">Reportes</h1>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-ink-500">
            <span>Ventas y rendimiento del restaurante</span>
            {ventasQuery.isFetching ? (
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
        <div className="no-print">
          <Button type="button" variant="ghost" loading={ventasQuery.isFetching} onClick={() => void ventasQuery.refetch()}>
            <RefreshCw aria-hidden="true" size={15} strokeWidth={1.8} />
            Actualizar
          </Button>
        </div>
      </div>

      <form className="no-print mb-5 rounded-lg border border-[rgba(42,30,20,0.08)] bg-white p-4 shadow-sm-soft" onSubmit={handleSubmit}>
        <div className="grid gap-3 md:grid-cols-[1fr_1fr_220px_auto] md:items-end">
          <div>
            <label className="mb-1.5 block text-label uppercase text-ink-500" htmlFor="reportes-from">Desde</label>
            <input
              id="reportes-from"
              type="date"
              value={draftFilters.from}
              className="h-10 w-full rounded-md border border-[rgba(42,30,20,0.14)] px-3.5 text-sm text-ink-900 transition focus:border-terracotta-500 focus:ring-4 focus:ring-terracotta-100"
              onChange={(event) => setDraftFilters((current) => ({ ...current, from: event.target.value }))}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-label uppercase text-ink-500" htmlFor="reportes-to">Hasta</label>
            <input
              id="reportes-to"
              type="date"
              value={draftFilters.to}
              className="h-10 w-full rounded-md border border-[rgba(42,30,20,0.14)] px-3.5 text-sm text-ink-900 transition focus:border-terracotta-500 focus:ring-4 focus:ring-terracotta-100"
              onChange={(event) => setDraftFilters((current) => ({ ...current, to: event.target.value }))}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-label uppercase text-ink-500" htmlFor="reportes-granularidad">Granularidad</label>
            <select
              id="reportes-granularidad"
              value={draftFilters.granularidad}
              className="h-10 w-full rounded-md border border-[rgba(42,30,20,0.14)] px-3.5 text-sm text-ink-900 transition focus:border-terracotta-500 focus:ring-4 focus:ring-terracotta-100"
              onChange={(event) => setDraftFilters((current) => ({ ...current, granularidad: event.target.value as ReporteGranularidad }))}
            >
              {granularidades.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </div>
          <Button type="submit" variant="primary">
            <CalendarDays aria-hidden="true" size={16} strokeWidth={1.8} />
            Aplicar
          </Button>
        </div>
      </form>

      {ventasQuery.isLoading ? <ReportesSkeleton /> : null}

      {ventasQuery.isError ? (
        <ErrorState
          title="No se pudo cargar el reporte"
          message={getErrorDetail(ventasQuery.error, 'No pudimos consultar las ventas del periodo seleccionado.')}
          onRetry={() => {
            void ventasQuery.refetch();
          }}
        />
      ) : null}

      {data ? (
        <div className="space-y-5">
          <div className="hidden print:block">
            <div className="mb-1 font-serif text-h2 text-ink-900">Reporte de ventas UTTOF</div>
            <div className="mb-4 text-xs text-ink-500">{rangeLabel}</div>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            <StatCard
              label="Ingresos totales"
              value={formatCurrency(data.ingresos_total)}
              icon={Banknote}
              iconVariant="green"
              spark={ingresosSeries.map((item) => item.valor)}
              sparkColor="#5BB39A"
              sparkFill="#CFEAE1"
            />
            <StatCard
              label="Pedidos totales"
              value={formatNumber(data.pedidos_total)}
              icon={ReceiptText}
              iconVariant="blue"
              spark={pedidosSeries.map((item) => item.valor)}
              sparkColor="#6B8FA8"
              sparkFill="#DCE6EF"
            />
            <StatCard
              label="Ticket promedio"
              value={formatCurrency(data.ticket_promedio)}
              icon={TrendingUp}
              iconVariant="saffron"
              spark={ticketSeries.map((item) => item.valor)}
              sparkColor="#D9A23B"
              sparkFill="#F5E2C0"
            />
          </div>
          <div className="grid gap-5 xl:grid-cols-2">
            <ReportTrendChart title="Ingresos" meta={`Periodo: ${rangeLabel}`} data={ingresosSeries} variant="area" valueType="currency" color="#E94B33" fill="#FACFC2" />
            <ReportTrendChart title="Pedidos" meta={`Periodo: ${rangeLabel}`} data={pedidosSeries} variant="bar" valueType="number" color="#6B8FA8" fill="#DCE6EF" />
            <ReportTrendChart title="Ticket promedio" meta={`Periodo: ${rangeLabel}`} data={ticketSeries} variant="area" valueType="currency" color="#D9A23B" fill="#F5E2C0" />
            <TopPlatillosReportChart data={data.top_platillos} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
