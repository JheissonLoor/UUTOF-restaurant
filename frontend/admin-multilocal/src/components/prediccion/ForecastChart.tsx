import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { PronosticoPunto } from '../../types/multilocal';

interface ForecastChartProps {
  data?: PronosticoPunto[];
  loading?: boolean;
  scopeLabel: string;
}

export function ForecastChart({ data = [], loading = false, scopeLabel }: ForecastChartProps) {
  return (
    <section className="min-h-[340px] rounded-card border border-[#E7DED3] bg-surface p-5 shadow-card">
      <header className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h3 className="font-display text-[18px] font-semibold text-ink">Demanda proyectada · {scopeLabel}</h3>
          <p className="mt-1 text-xs text-ink4">Pedidos esperados por franja horaria</p>
        </div>
        <span className="rounded-full bg-plum/10 px-2.5 py-1 font-mono text-[9px] font-semibold uppercase text-plum-dark">★ IA</span>
      </header>

      {loading ? (
        <div className="h-[240px] animate-pulse rounded-card bg-bg2" aria-label="Cargando curva de demanda" />
      ) : data.length === 0 ? (
        <div className="flex h-[240px] items-center justify-center text-sm text-ink3">No hay datos de demanda para esta selección.</div>
      ) : (
        <div className="h-[240px] w-full" aria-label="Curva de demanda estimada">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="forecastFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8C6BA1" stopOpacity={0.36} />
                  <stop offset="100%" stopColor="#8C6BA1" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#EEE6DC" strokeDasharray="3 5" vertical={false} />
              <XAxis dataKey="hora" axisLine={false} tickLine={false} tick={{ fill: '#9B9189', fontSize: 10 }} interval={1} />
              <YAxis axisLine={false} tickLine={false} allowDecimals={false} tick={{ fill: '#9B9189', fontSize: 10 }} />
              <Tooltip
                cursor={{ stroke: '#8C6BA1', strokeDasharray: '3 3' }}
                contentStyle={{ border: '1px solid #E7DED3', borderRadius: 8, color: '#1F1A14', fontSize: 12 }}
                formatter={(value) => [`${Number(value).toFixed(1)} pedidos`, 'Demanda']}
                labelFormatter={(label) => `Hora ${String(label)}`}
              />
              <Area
                type="monotone"
                dataKey="demanda"
                stroke="#6E4F84"
                strokeWidth={2.5}
                fill="url(#forecastFill)"
                activeDot={{ r: 5, fill: '#E8B14A', stroke: '#FFFFFF', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
