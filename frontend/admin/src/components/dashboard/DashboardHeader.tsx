import { Download, Plus } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

export function DashboardHeader(): JSX.Element {
  const { showToast } = useToast();

  return (
    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h1 className="font-serif text-[36px] font-semibold leading-tight text-ink-900">Panel de Administración</h1>
        <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-ink-500">
          Gestiona tu restaurante desde un solo lugar
          <span className="inline-flex items-center gap-1.5 rounded-full bg-sage-100 px-2.5 py-1 text-xs font-medium text-sage-500">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-sage-500" />
            En vivo
          </span>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-md border border-[rgba(42,30,20,0.08)] bg-white p-1 shadow-sm-soft">
          {['Hoy', 'Semana', 'Mes', 'Año'].map((item) => (
            <button
              key={item}
              type="button"
              className={`rounded-sm px-3 py-1.5 text-[13px] font-medium transition ${item === 'Hoy' ? 'bg-cream-100 text-ink-900' : 'text-ink-500 hover:text-ink-900'}`}
            >
              {item}
            </button>
          ))}
        </div>
        <Button type="button" variant="ghost" onClick={() => showToast({ variant: 'info', title: 'Exportación', description: 'La exportación detallada se implementa en Reportes.' })}>
          <Download aria-hidden="true" size={15} strokeWidth={1.8} />
          Exportar
        </Button>
        <Button type="button" variant="primary" onClick={() => showToast({ variant: 'info', title: 'Nuevo pedido', description: 'El flujo de pedido se implementa después del panel.' })}>
          <Plus aria-hidden="true" size={15} strokeWidth={1.8} />
          Nuevo pedido
        </Button>
      </div>
    </div>
  );
}
