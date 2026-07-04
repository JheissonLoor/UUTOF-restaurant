import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';

interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

interface DonutProps {
  data: DonutSegment[];
}

export function Donut({ data }: DonutProps): JSX.Element {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const chartData = total > 0 ? data : [{ label: 'Sin datos', value: 1, color: '#EADFCD' }];

  return (
    <div className="relative h-[140px] w-[140px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={chartData} dataKey="value" innerRadius={44} outerRadius={66} paddingAngle={2} stroke="none">
            {chartData.map((entry) => (
              <Cell key={entry.label} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="font-serif text-h2 tnum">{total}</div>
          <div className="text-[11px] text-ink-500">pedidos</div>
        </div>
      </div>
    </div>
  );
}
