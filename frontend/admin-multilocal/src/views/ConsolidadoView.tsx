import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';
import { getApiErrorMessage } from '../api/errors';
import { getMetricasConsolidado } from '../api/multilocal';
import { BranchPerfTable } from '../components/consolidado/BranchPerfTable';
import { KpiRow } from '../components/consolidado/KpiRow';
import { useMetricasRealtime } from '../hooks/useMetricasRealtime';
import { TopBar } from '../layout/TopBar';
import type { RangoMetricas } from '../types/multilocal';

const dateFormatter = new Intl.DateTimeFormat('es-PE', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'America/Lima',
});

export function ConsolidadoView() {
  const [rango, setRango] = useState<RangoMetricas>('hoy');
  useMetricasRealtime();
  const query = useQuery({
    queryKey: ['metricas', 'consolidado', rango],
    queryFn: () => getMetricasConsolidado(rango),
    refetchInterval: 60_000,
  });

  const subtitle = useMemo(() => {
    const date = dateFormatter.format(new Date());
    const branches = query.data?.por_sucursal.length;
    return `${date.charAt(0).toUpperCase()}${date.slice(1)} · ${branches ?? '—'} sucursales activas · Lima`;
  }, [query.data?.por_sucursal.length]);

  return (
    <section className="animate-view-in" aria-labelledby="titulo-consolidado">
      <TopBar
        title="Vista consolidada"
        subtitle={subtitle}
        titleId="titulo-consolidado"
        actions={
          <label className="flex h-10 items-center rounded-card border border-[#DDD2C5] bg-surface px-3">
            <span className="sr-only">Rango de métricas</span>
            <select
              value={rango}
              onChange={(event) => setRango(event.target.value as RangoMetricas)}
              className="cursor-pointer border-0 bg-transparent pr-7 text-[13px] font-semibold text-ink2 outline-none"
            >
              <option value="hoy">Hoy</option>
              <option value="7d">Últimos 7 días</option>
              <option value="30d">Últimos 30 días</option>
            </select>
          </label>
        }
      />

      {query.isError ? (
        <div role="alert" className="mb-4 flex items-center justify-between rounded-card border border-danger/25 bg-danger/10 px-4 py-3 text-sm text-danger">
          <span>{getApiErrorMessage(query.error)}</span>
          <button
            type="button"
            onClick={() => void query.refetch()}
            className="flex h-9 items-center gap-2 rounded-card px-3 font-semibold transition-colors hover:bg-danger/10"
          >
            <RefreshCw size={15} aria-hidden="true" />
            Reintentar
          </button>
        </div>
      ) : null}

      <KpiRow kpis={query.data?.kpis} loading={query.isPending} />

      <div className="mb-3 flex items-center gap-2">
        <h2 className="font-mono text-[10px] font-semibold uppercase text-ink4">
          Rendimiento por sucursal
        </h2>
        <span className="h-px flex-1 bg-[#E7DED3]" />
      </div>
      <BranchPerfTable
        branches={query.data?.por_sucursal}
        total={query.data?.kpis}
        loading={query.isPending}
      />
    </section>
  );
}
