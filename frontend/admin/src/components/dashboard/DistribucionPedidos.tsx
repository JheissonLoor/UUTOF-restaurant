import { Donut } from '@/components/charts/Donut';
import { Card } from '@/components/ui/Card';
import type { DashboardDistribucionItem } from '@/types/api';

interface DistribucionPedidosProps {
  data: DashboardDistribucionItem[];
}

const colors: Record<string, string> = {
  espera: '#D9A23B',
  preparacion: '#E94B33',
  terminado: '#6B8FA8',
  falta_pagar: '#C04A3D',
  pagado: '#5BB39A',
  cancelado: '#8E8378',
};

export function DistribucionPedidos({ data }: DistribucionPedidosProps): JSX.Element {
  const total = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card title="Distribución de Pedidos" meta="hoy">
      <div className="grid gap-5 sm:grid-cols-[140px_1fr] sm:items-center">
        <Donut data={data.map((item) => ({ label: item.label, value: item.count, color: colors[item.key] ?? '#B3A89C' }))} />
        <div>
          {data.map((item) => {
            const pct = total > 0 ? (item.count / total) * 100 : 0;
            return (
              <div key={item.key} className="grid grid-cols-[132px_1fr_36px] items-center gap-3 border-b border-dashed border-[rgba(42,30,20,0.08)] py-2 text-[13px] last:border-b-0">
                <div className="flex items-center gap-2 text-ink-700">
                  <span className="h-2 w-2 rounded-full" style={{ background: colors[item.key] }} />
                  {item.label}
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-cream-100">
                  <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${pct}%`, background: colors[item.key] }} />
                </div>
                <div className="text-right font-semibold text-ink-900 tnum">{item.count}</div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
