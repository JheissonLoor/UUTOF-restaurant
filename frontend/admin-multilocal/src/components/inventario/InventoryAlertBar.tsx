import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { InventarioItem } from '../../types/multilocal';

interface InventoryAlertBarProps {
  items: InventarioItem[];
  onShowCritical: () => void;
}

export function InventoryAlertBar({ items, onShowCritical }: InventoryAlertBarProps) {
  const critical = items.filter((item) => item.estado === 'critico').length;
  const low = items.filter((item) => item.estado === 'bajo').length;

  if (critical === 0 && low === 0) {
    return (
      <div className="mb-4 flex min-h-12 items-center gap-3 rounded-card border border-mint/25 bg-mint/10 px-4 py-3 text-sm text-mint-dark">
        <CheckCircle2 size={18} aria-hidden="true" />
        <span className="font-semibold">Todo el stock está en niveles saludables.</span>
      </div>
    );
  }

  return (
    <div className="mb-4 flex min-h-12 items-center justify-between gap-4 rounded-card border border-danger/25 bg-danger/10 px-4 py-3 text-sm text-danger">
      <span className="flex items-center gap-3">
        <AlertTriangle size={18} aria-hidden="true" />
        <strong>{critical} críticos · {low} con stock bajo</strong>
      </span>
      {critical > 0 ? (
        <button type="button" onClick={onShowCritical} className="h-8 rounded-card px-3 text-xs font-semibold hover:bg-danger/10">
          Ver críticos
        </button>
      ) : null}
    </div>
  );
}
