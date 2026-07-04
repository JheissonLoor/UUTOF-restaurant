import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency } from '@/lib/format';
import type { VentasReporte } from '@/types/api';

interface TopPlatillosReportChartProps {
  data: VentasReporte['top_platillos'];
}

export function TopPlatillosReportChart({ data }: TopPlatillosReportChartProps): JSX.Element {
  return (
    <Card title="Top platillos" meta="Ingresos generados por cada platillo" className="report-chart-card">
      {data.length === 0 ? (
        <EmptyState title="Sin platillos vendidos" description="Los productos con más ingresos aparecerán cuando existan pedidos pagados." />
      ) : (
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 6, right: 20, bottom: 0, left: 4 }}>
              <CartesianGrid stroke="rgba(42,30,20,0.08)" horizontal={false} />
              <XAxis
                type="number"
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#6B6056', fontSize: 11 }}
                tickFormatter={(value: number) => `S/ ${new Intl.NumberFormat('es-PE', { notation: 'compact' }).format(value)}`}
              />
              <YAxis
                type="category"
                dataKey="nombre"
                width={104}
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#3A322A', fontSize: 11 }}
              />
              <Tooltip
                formatter={(value: number, name: string) => [
                  name === 'ingresos' ? formatCurrency(value) : value,
                  name === 'ingresos' ? 'Ingresos' : 'Unidades',
                ]}
                contentStyle={{
                  border: '1px solid rgba(42,30,20,0.08)',
                  borderRadius: 12,
                  boxShadow: '0 8px 24px -8px rgba(42,30,20,0.12)',
                  fontSize: 12,
                }}
              />
              <Bar dataKey="ingresos" fill="#E94B33" radius={[0, 6, 6, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
