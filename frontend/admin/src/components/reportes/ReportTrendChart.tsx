import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency, formatNumber } from '@/lib/format';

interface TrendPoint {
  periodo: string;
  valor: number;
}

interface ReportTrendChartProps {
  title: string;
  meta: string;
  data: TrendPoint[];
  variant: 'area' | 'bar';
  valueType: 'currency' | 'number';
  color: string;
  fill: string;
}

function compactValue(value: number, valueType: ReportTrendChartProps['valueType']): string {
  if (valueType === 'currency') {
    return `S/ ${new Intl.NumberFormat('es-PE', { notation: 'compact', maximumFractionDigits: 1 }).format(value)}`;
  }
  return new Intl.NumberFormat('es-PE', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
}

export function ReportTrendChart({
  title,
  meta,
  data,
  variant,
  valueType,
  color,
  fill,
}: ReportTrendChartProps): JSX.Element {
  const formatValue = valueType === 'currency' ? formatCurrency : formatNumber;

  return (
    <Card title={title} meta={meta} className="report-chart-card">
      {data.length === 0 ? (
        <EmptyState title="Sin datos en este periodo" description="Ajusta el rango de fechas para consultar movimientos registrados." />
      ) : (
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {variant === 'area' ? (
              <AreaChart data={data} margin={{ top: 14, right: 8, bottom: 0, left: -10 }}>
                <defs>
                  <linearGradient id={`report-area-${title}`} x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={fill} stopOpacity={0.06} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(42,30,20,0.08)" vertical={false} />
                <XAxis dataKey="periodo" tickLine={false} axisLine={false} tick={{ fill: '#6B6056', fontSize: 11 }} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#6B6056', fontSize: 11 }}
                  tickFormatter={(value: number) => compactValue(value, valueType)}
                />
                <Tooltip
                  formatter={(value: number) => [formatValue(value), title]}
                  contentStyle={{
                    border: '1px solid rgba(42,30,20,0.08)',
                    borderRadius: 12,
                    boxShadow: '0 8px 24px -8px rgba(42,30,20,0.12)',
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="valor"
                  stroke={color}
                  strokeWidth={2.4}
                  fill={`url(#report-area-${title})`}
                  isAnimationActive={false}
                />
              </AreaChart>
            ) : (
              <BarChart data={data} margin={{ top: 14, right: 8, bottom: 0, left: -10 }}>
                <CartesianGrid stroke="rgba(42,30,20,0.08)" vertical={false} />
                <XAxis dataKey="periodo" tickLine={false} axisLine={false} tick={{ fill: '#6B6056', fontSize: 11 }} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#6B6056', fontSize: 11 }}
                  tickFormatter={(value: number) => compactValue(value, valueType)}
                />
                <Tooltip
                  formatter={(value: number) => [formatValue(value), title]}
                  contentStyle={{
                    border: '1px solid rgba(42,30,20,0.08)',
                    borderRadius: 12,
                    boxShadow: '0 8px 24px -8px rgba(42,30,20,0.12)',
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="valor" fill={color} radius={[6, 6, 0, 0]} isAnimationActive={false} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
