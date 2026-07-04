import { Banknote, CalendarDays, CreditCard } from 'lucide-react';

import { Card } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/format';
import type { DashboardPagoTipo } from '@/types/api';

interface PagosPorTipoProps {
  data: DashboardPagoTipo[];
}

const icons = [CreditCard, Banknote, CalendarDays];
const colors = [
  { bg: 'bg-sky-100', text: 'text-sky-500', bar: 'bg-sky-500' },
  { bg: 'bg-sage-100', text: 'text-sage-500', bar: 'bg-sage-500' },
  { bg: 'bg-saffron-100', text: 'text-saffron-500', bar: 'bg-saffron-500' },
];

export function PagosPorTipo({ data }: PagosPorTipoProps): JSX.Element {
  const total = data.reduce((sum, item) => sum + item.amount, 0);

  return (
    <Card title="Métodos de Pago" meta={`${formatCurrency(total)} total`}>
      <div>
        {data.map((item, index) => {
          const Icon = icons[index] ?? CreditCard;
          const color = colors[index] ?? colors[0];
          return (
            <div key={item.name} className="border-b border-dashed border-[rgba(42,30,20,0.08)] py-3 last:border-b-0">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`grid h-9 w-9 place-items-center rounded-md ${color.bg} ${color.text}`}>
                    <Icon aria-hidden="true" size={17} strokeWidth={1.8} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-ink-900">{item.name}</div>
                    <div className="text-xs text-ink-500">{item.sub}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-ink-900 tnum">{formatCurrency(item.amount)}</div>
                  <div className="text-[11px] text-ink-500 tnum">{item.pct.toFixed(0)}%</div>
                </div>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-cream-100">
                <div className={`h-full rounded-full ${color.bar}`} style={{ width: `${Math.max(0, Math.min(100, item.pct))}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
