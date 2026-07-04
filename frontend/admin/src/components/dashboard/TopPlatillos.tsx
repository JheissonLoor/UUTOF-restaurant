import { Flame } from 'lucide-react';

import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import type { DashboardTopPlatillo } from '@/types/api';

interface TopPlatillosProps {
  data: DashboardTopPlatillo[];
}

export function TopPlatillos({ data }: TopPlatillosProps): JSX.Element {
  return (
    <Card title="Top Platillos · hoy" meta={`${data.length} platillos`}>
      {data.length === 0 ? (
        <EmptyState title="Sin ventas todavía" description="Cuando entren pedidos, los platillos más vendidos aparecerán aquí." />
      ) : (
        <div>
          {data.map((platillo, index) => (
            <div key={platillo.id_platillo} className="grid grid-cols-[28px_1fr_auto] items-center gap-3 border-b border-dashed border-[rgba(42,30,20,0.08)] py-3 last:border-b-0">
              <div className="grid h-7 place-items-center font-serif text-lg font-semibold text-ink-400">
                {index === 0 ? <Flame aria-hidden="true" size={16} strokeWidth={2} className="text-terracotta-500" /> : String(index + 1).padStart(2, '0')}
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-ink-900">{platillo.nombre}</div>
                <div className="text-xs text-ink-500">{platillo.categoria}</div>
                <div className="mt-1.5 h-1.5 w-24 overflow-hidden rounded-full bg-cream-100">
                  <div className="h-full rounded-full bg-terracotta-400" style={{ width: `${Math.max(0, Math.min(1, platillo.pct)) * 100}%` }} />
                </div>
              </div>
              <div className="font-semibold text-ink-900 tnum">{platillo.cantidad}</div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
