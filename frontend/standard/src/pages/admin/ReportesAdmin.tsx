import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, CalendarDays, ReceiptText, WalletCards } from 'lucide-react';

import { getVentasReporte, type VentasParams } from '@/api/reportes';
import { ErrorState } from '@/components/ErrorState';
import { formatCurrency } from '@/lib/format';

function localDate(daysAgo = 0): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function ReportSkeleton() {
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        {[0, 1, 2].map((item) => <div key={item} className="h-28 animate-pulse rounded-2xl bg-muted" />)}
      </div>
      <div className="h-72 animate-pulse rounded-2xl bg-muted" />
    </div>
  );
}

export function ReportesAdmin() {
  const [filters, setFilters] = useState<VentasParams>({
    from: localDate(29),
    to: localDate(),
    granularidad: 'dia',
  });
  const [applied, setApplied] = useState(filters);

  const reportQuery = useQuery({
    queryKey: ['reporte-ventas', applied],
    queryFn: () => getVentasReporte(applied),
    enabled: applied.from <= applied.to,
  });

  const maxIncome = useMemo(
    () => Math.max(...(reportQuery.data?.ingresos_por_periodo.map((item) => Number(item.monto)) ?? [0]), 1),
    [reportQuery.data],
  );

  const applyFilters = () => {
    if (filters.from <= filters.to) setApplied(filters);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-card p-5">
        <div className="mb-4 flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-primary" />
          <h2 className="font-heading text-lg font-semibold">Periodo del reporte</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end">
          <label className="text-sm font-medium">
            Desde
            <input
              type="date"
              value={filters.from}
              max={filters.to}
              onChange={(event) => setFilters({ ...filters, from: event.target.value })}
              className="mt-1.5 min-h-11 w-full rounded-xl border bg-background px-3 outline-none focus:border-primary"
            />
          </label>
          <label className="text-sm font-medium">
            Hasta
            <input
              type="date"
              value={filters.to}
              min={filters.from}
              onChange={(event) => setFilters({ ...filters, to: event.target.value })}
              className="mt-1.5 min-h-11 w-full rounded-xl border bg-background px-3 outline-none focus:border-primary"
            />
          </label>
          <label className="text-sm font-medium">
            Agrupar por
            <select
              value={filters.granularidad}
              onChange={(event) => setFilters({ ...filters, granularidad: event.target.value as VentasParams['granularidad'] })}
              className="mt-1.5 min-h-11 w-full rounded-xl border bg-background px-3 outline-none focus:border-primary"
            >
              <option value="dia">Día</option>
              <option value="semana">Semana</option>
              <option value="mes">Mes</option>
            </select>
          </label>
          <button
            type="button"
            onClick={applyFilters}
            disabled={filters.from > filters.to}
            className="min-h-11 rounded-xl bg-primary px-5 font-semibold text-primary-foreground transition hover:brightness-110 disabled:opacity-50"
          >
            Consultar
          </button>
        </div>
        {filters.from > filters.to && <p className="mt-2 text-sm text-destructive">La fecha inicial debe ser anterior a la fecha final.</p>}
      </section>

      {reportQuery.isLoading && <ReportSkeleton />}
      {reportQuery.isError && <ErrorState message="No se pudo cargar el reporte de ventas." onRetry={() => reportQuery.refetch()} />}
      {reportQuery.data && (
        <>
          <section className="grid gap-3 sm:grid-cols-3">
            {[
              { label: 'Ingresos', value: formatCurrency(Number(reportQuery.data.ingresos_total)), icon: WalletCards },
              { label: 'Pedidos', value: reportQuery.data.pedidos_total.toString(), icon: ReceiptText },
              { label: 'Ticket promedio', value: formatCurrency(Number(reportQuery.data.ticket_promedio)), icon: BarChart3 },
            ].map((item) => (
              <article key={item.label} className="rounded-2xl border bg-card p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <p className="mt-3 text-2xl font-bold">{item.value}</p>
              </article>
            ))}
          </section>

          <section className="rounded-2xl border bg-card p-5">
            <h2 className="font-heading text-lg font-semibold">Ingresos por periodo</h2>
            {reportQuery.data.ingresos_por_periodo.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted-foreground">No hay ventas registradas en este periodo.</p>
            ) : (
              <div className="mt-5 space-y-3">
                {reportQuery.data.ingresos_por_periodo.map((item) => (
                  <div key={item.periodo} className="grid grid-cols-[90px_1fr_auto] items-center gap-3 text-sm">
                    <span className="truncate text-muted-foreground">{item.periodo}</span>
                    <div className="h-3 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${Math.max((Number(item.monto) / maxIncome) * 100, 2)}%` }}
                      />
                    </div>
                    <strong className="min-w-20 text-right">{formatCurrency(Number(item.monto))}</strong>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl border bg-card p-5">
            <h2 className="font-heading text-lg font-semibold">Platillos más vendidos</h2>
            {reportQuery.data.top_platillos.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">Aún no hay platillos vendidos en este periodo.</p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[520px] text-left text-sm">
                  <thead className="border-b text-xs uppercase text-muted-foreground">
                    <tr><th className="py-3">Platillo</th><th className="py-3 text-right">Cantidad</th><th className="py-3 text-right">Ingresos</th></tr>
                  </thead>
                  <tbody>
                    {reportQuery.data.top_platillos.map((item) => (
                      <tr key={item.id_platillo} className="border-b last:border-0">
                        <td className="py-3 font-medium">{item.nombre}</td>
                        <td className="py-3 text-right">{item.cantidad}</td>
                        <td className="py-3 text-right font-semibold">{formatCurrency(Number(item.ingresos))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
