import { fmtInteger, fmtPercent, fmtSoles } from '../../lib/format';
import type { ConsolidadoKpis } from '../../types/multilocal';
import { KpiCard } from './KpiCard';

interface KpiRowProps {
  kpis?: ConsolidadoKpis;
  loading?: boolean;
}

export function KpiRow({ kpis, loading = false }: KpiRowProps) {
  if (loading) {
    return (
      <div className="mb-[22px] grid grid-cols-4 gap-4" aria-label="Cargando indicadores">
        {['ingresos', 'pedidos', 'ticket', 'ocupacion'].map((key) => (
          <KpiCard key={key} label={key} loading />
        ))}
      </div>
    );
  }

  return (
    <div className="mb-[22px] grid grid-cols-4 gap-4" aria-label="Indicadores consolidados">
      <KpiCard
        label="Ingresos · red"
        value={kpis ? fmtSoles(kpis.ingresos) : undefined}
        delta={kpis?.delta.ingresos}
      />
      <KpiCard
        label="Pedidos · red"
        value={kpis ? fmtInteger(kpis.pedidos) : undefined}
        delta={kpis?.delta.pedidos}
      />
      <KpiCard
        label="Ticket promedio"
        value={kpis ? fmtSoles(kpis.ticket_prom) : undefined}
        delta={kpis?.delta.ticket_prom}
      />
      <KpiCard
        label="Ocupación media"
        value={kpis ? fmtPercent(kpis.ocupacion) : undefined}
        delta={kpis?.delta.ocupacion}
      />
    </div>
  );
}
