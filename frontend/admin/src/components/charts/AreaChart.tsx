import {
  Area,
  AreaChart as RechartsAreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { formatCurrency } from '@/lib/format';

interface AreaChartProps {
  labels: string[];
  current: number[];
  previous: number[];
}

interface RevenuePoint {
  label: string;
  actual: number;
  anterior: number;
}

export function AreaChart({ labels, current, previous }: AreaChartProps): JSX.Element {
  const data: RevenuePoint[] = labels.map((label, index) => ({
    label,
    actual: current[index] ?? 0,
    anterior: previous[index] ?? 0,
  }));

  return (
    <div className="h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart data={data} margin={{ top: 14, right: 8, bottom: 0, left: -18 }}>
          <defs>
            <linearGradient id="revenueActual" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#E94B33" stopOpacity={0.32} />
              <stop offset="100%" stopColor="#E94B33" stopOpacity={0.04} />
            </linearGradient>
            <linearGradient id="revenuePrevious" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#B3A89C" stopOpacity={0.22} />
              <stop offset="100%" stopColor="#B3A89C" stopOpacity={0.03} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(42,30,20,0.08)" vertical={false} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: '#6B6056', fontSize: 11 }} />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#6B6056', fontSize: 11 }}
            tickFormatter={(value: number) => `S/ ${Math.round(value / 1000)}k`}
          />
          <Tooltip
            cursor={{ stroke: '#E94B33', strokeWidth: 1, strokeDasharray: '4 4' }}
            formatter={(value: number) => [formatCurrency(value), '']}
            labelStyle={{ color: '#1F1A14', fontWeight: 600 }}
            contentStyle={{
              border: '1px solid rgba(42,30,20,0.08)',
              borderRadius: 12,
              boxShadow: '0 8px 24px -8px rgba(42,30,20,0.12)',
              fontSize: 12,
            }}
          />
          <Area
            type="monotone"
            dataKey="anterior"
            name="Anterior"
            stroke="#B3A89C"
            strokeWidth={2}
            fill="url(#revenuePrevious)"
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="actual"
            name="Esta semana"
            stroke="#E94B33"
            strokeWidth={2.4}
            fill="url(#revenueActual)"
            isAnimationActive={false}
          />
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
}
