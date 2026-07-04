import clsx from 'clsx';
import { AlertTriangle, Info } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';
import type { AlertLevel, DashboardAlerta } from '@/types/api';

interface AlertsBannerProps {
  data: DashboardAlerta[];
}

const toneClasses: Record<AlertLevel, string> = {
  urgent: 'border-l-wine-500 bg-wine-100',
  warn: 'border-l-saffron-500 bg-saffron-100',
  info: 'border-l-sky-500 bg-sky-100',
};

const iconClasses: Record<AlertLevel, string> = {
  urgent: 'bg-wine-100 text-wine-500',
  warn: 'bg-saffron-100 text-saffron-600',
  info: 'bg-sky-100 text-sky-500',
};

export function AlertsBanner({ data }: AlertsBannerProps): JSX.Element {
  const { showToast } = useToast();
  const [hiddenTitles, setHiddenTitles] = useState<string[]>(() => {
    const raw = window.localStorage.getItem('uttof.hidden_alerts');
    if (!raw) return [];
    try {
      const parsed: unknown = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === 'string') : [];
    } catch {
      return [];
    }
  });

  const visibleAlerts = useMemo(() => data.filter((alert) => !hiddenTitles.includes(alert.title)), [data, hiddenTitles]);

  function postpone(title: string): void {
    const next = [...hiddenTitles, title];
    setHiddenTitles(next);
    window.localStorage.setItem('uttof.hidden_alerts', JSON.stringify(next));
    showToast({ variant: 'success', title: 'Alerta pospuesta', description: 'Se ocultó de este navegador.' });
  }

  return (
    <Card title="Requiere atención" meta={`${visibleAlerts.length} alertas`}>
      {visibleAlerts.length === 0 ? (
        <EmptyState title="Sin alertas" description="No hay eventos que requieran atención inmediata." />
      ) : (
        <div className="flex flex-col gap-3">
          {visibleAlerts.map((alert) => {
            const Icon = alert.level === 'info' ? Info : AlertTriangle;
            return (
              <div key={alert.title} className={clsx('flex items-start gap-3 rounded-md border border-[rgba(42,30,20,0.08)] border-l-[3px] p-3', toneClasses[alert.level])}>
                <div className={clsx('grid h-8 w-8 shrink-0 place-items-center rounded-md', iconClasses[alert.level])}>
                  <Icon aria-hidden="true" size={16} strokeWidth={1.8} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-ink-900">{alert.title}</div>
                  <div className="mt-0.5 text-xs text-ink-500">{alert.sub}</div>
                </div>
                <div className="flex shrink-0 gap-2">
                  {alert.accionable ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => showToast({ variant: 'info', title: 'Acción pendiente', description: alert.accion_url ?? 'Sin URL de acción.' })}
                    >
                      Resolver
                    </Button>
                  ) : null}
                  <Button type="button" variant="ghost" size="sm" onClick={() => postpone(alert.title)}>
                    Posponer
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
