import { Banknote, ReceiptText, Table2, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { StatCard } from '@/components/ui/StatCard';
import { formatCurrency, formatNumber, getDelta } from '@/lib/format';
import type { DashboardResponse } from '@/types/api';

interface StatsRowProps {
  data: DashboardResponse;
}

export function StatsRow({ data }: StatsRowProps): JSX.Element {
  const navigate = useNavigate();
  const hoy = data.hoy;
  const ocupacion = hoy.mesas_totales > 0 ? (hoy.mesas_ocupadas / hoy.mesas_totales) * 100 : 0;

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Ingresos hoy"
        value={formatCurrency(hoy.ingresos)}
        icon={Banknote}
        iconVariant="green"
        delta={getDelta(hoy.ingresos, hoy.ingresos_ayer)}
        deltaLabel="vs. ayer"
        spark={data.ingresos_por_dia.esta_semana}
        sparkColor="#5BB39A"
        sparkFill="#CFEAE1"
        onClick={() => navigate('/reportes?metric=ingresos')}
      />
      <StatCard
        label="Pedidos totales"
        value={formatNumber(hoy.pedidos)}
        icon={ReceiptText}
        iconVariant="blue"
        delta={getDelta(hoy.pedidos, hoy.pedidos_ayer)}
        deltaLabel="vs. ayer"
        spark={[hoy.pedidos_ayer, hoy.pedidos]}
        sparkColor="#6B8FA8"
        sparkFill="#DCE6EF"
        onClick={() => navigate('/reportes?metric=pedidos')}
      />
      <StatCard
        label="Mesas ocupadas"
        value={`${hoy.mesas_ocupadas}/${hoy.mesas_totales}`}
        icon={Table2}
        iconVariant="terracotta"
        delta={0}
        deltaLabel={`${ocupacion.toFixed(0)}% ocupación`}
        spark={[0, hoy.mesas_ocupadas, hoy.mesas_totales]}
        sparkColor="#E94B33"
        sparkFill="#FACFC2"
        onClick={() => navigate('/mesas')}
      />
      <StatCard
        label="Ticket promedio"
        value={formatCurrency(hoy.ticket_promedio)}
        icon={TrendingUp}
        iconVariant="saffron"
        delta={getDelta(hoy.ticket_promedio, hoy.ticket_promedio_ayer)}
        deltaLabel="vs. ayer"
        spark={[hoy.ticket_promedio_ayer, hoy.ticket_promedio]}
        sparkColor="#D9A23B"
        sparkFill="#F5E2C0"
        onClick={() => navigate('/reportes?metric=ticket')}
      />
    </div>
  );
}
