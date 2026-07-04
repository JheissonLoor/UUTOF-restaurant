import { useMemo, useState } from 'react';

import { AreaChart } from '@/components/charts/AreaChart';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { DeltaBadge } from '@/components/ui/DeltaBadge';
import { formatCurrency, getDelta } from '@/lib/format';
import type { DashboardIngresosPorDia } from '@/types/api';

interface RevenueChartProps {
  data: DashboardIngresosPorDia;
}

const periods = ['7d', '14d', '30d', '90d'] as const;
type Period = (typeof periods)[number];

export function RevenueChart({ data }: RevenueChartProps): JSX.Element {
  const [period, setPeriod] = useState<Period>('14d');
  const totalActual = useMemo(() => data.esta_semana.reduce((sum, value) => sum + value, 0), [data.esta_semana]);
  const totalAnterior = useMemo(() => data.semana_anterior.reduce((sum, value) => sum + value, 0), [data.semana_anterior]);

  return (
    <Card
      title="Ingresos · últimos 14 días"
      action={
        <div className="inline-flex rounded-md bg-cream-100 p-1">
          {periods.map((item) => (
            <Button
              key={item}
              type="button"
              variant="icon"
              className={`h-7 w-auto rounded-sm px-2 text-xs ${period === item ? 'bg-white text-ink-900 shadow-sm-soft' : ''}`}
              onClick={() => setPeriod(item)}
            >
              {item}
            </Button>
          ))}
        </div>
      }
    >
      <div className="mb-5 flex flex-wrap items-end gap-3">
        <div className="font-serif text-display-xl text-ink-900 tnum">{formatCurrency(totalActual)}</div>
        <DeltaBadge value={getDelta(totalActual, totalAnterior)} />
        <span className="pb-1 text-xs text-ink-500">vs. período anterior</span>
      </div>
      <div className="mb-3 flex gap-4 text-xs text-ink-500">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-terracotta-500" />
          Esta semana
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-ink-300" />
          Anterior
        </span>
      </div>
      <AreaChart labels={data.labels} current={data.esta_semana} previous={data.semana_anterior} />
    </Card>
  );
}
