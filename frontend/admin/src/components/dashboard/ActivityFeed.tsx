import { Banknote, CalendarDays, CheckCircle2, ReceiptText, Star } from 'lucide-react';

import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { relativeTime } from '@/lib/format';
import type { ActivityType, DashboardActividadItem } from '@/types/api';

interface ActivityFeedProps {
  data: DashboardActividadItem[];
}

const icons = {
  order: ReceiptText,
  pay: Banknote,
  ready: CheckCircle2,
  reserve: CalendarDays,
  review: Star,
};

const iconClasses: Record<ActivityType, string> = {
  order: 'bg-terracotta-50 text-terracotta-500',
  pay: 'bg-sage-100 text-sage-500',
  ready: 'bg-sky-100 text-sky-500',
  reserve: 'bg-saffron-100 text-saffron-500',
  review: 'bg-wine-100 text-wine-500',
};

export function ActivityFeed({ data }: ActivityFeedProps): JSX.Element {
  return (
    <Card title="Actividad Reciente" meta="en vivo">
      {data.length === 0 ? (
        <EmptyState title="Sin actividad reciente" description="Los pedidos, pagos y reservas recientes aparecerán aquí." />
      ) : (
        <div>
          {data.map((item, index) => {
            const Icon = icons[item.type];
            return (
              <button
                key={`${item.type}-${item.when}-${index}`}
                type="button"
                className="flex w-full gap-3 border-b border-dashed border-[rgba(42,30,20,0.08)] py-3 text-left transition hover:bg-cream-50 last:border-b-0"
              >
                <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${iconClasses[item.type]}`}>
                  <Icon aria-hidden="true" size={15} strokeWidth={1.8} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[13.5px] text-ink-900">
                    <span className="font-semibold">{item.who}</span> — {item.what}
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-ink-500">
                    <span>{relativeTime(item.when)}</span>
                    <span className="text-ink-300">·</span>
                    <Avatar label={item.actor} tone={item.type} size="sm" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </Card>
  );
}
