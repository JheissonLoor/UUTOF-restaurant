import clsx from 'clsx';
import { Image as ImageIcon, Loader2, Pencil, Power, Utensils } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Pill } from '@/components/ui/Pill';
import { formatCurrency } from '@/lib/format';
import type { Platillo } from '@/types/api';

interface PlatilloCardProps {
  platillo: Platillo;
  categoriaNombre: string;
  isUpdating?: boolean;
  onEdit: (platillo: Platillo) => void;
  onToggleDisponible: (platillo: Platillo) => void;
}

export function PlatilloCard({
  platillo,
  categoriaNombre,
  isUpdating = false,
  onEdit,
  onToggleDisponible,
}: PlatilloCardProps): JSX.Element {
  const [imageFailed, setImageFailed] = useState(false);
  const shouldShowImage = Boolean(platillo.imagen_url) && !imageFailed;

  return (
    <article className="group overflow-hidden rounded-lg border border-[rgba(42,30,20,0.08)] bg-white shadow-sm-soft transition duration-200 hover:-translate-y-0.5 hover:shadow-md-soft">
      <div className="relative aspect-[4/3] bg-cream-100">
        {shouldShowImage ? (
          <img
            src={platillo.imagen_url ?? undefined}
            alt={platillo.nombre}
            className="h-full w-full object-cover"
            loading="lazy"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="grid h-full place-items-center bg-[linear-gradient(135deg,#F4ECE0_0%,#FAF6F0_100%)] text-ink-400">
            <div className="grid h-14 w-14 place-items-center rounded-full border border-[rgba(42,30,20,0.08)] bg-white/80 shadow-sm-soft">
              {platillo.imagen_url ? (
                <ImageIcon aria-hidden="true" size={24} strokeWidth={1.7} />
              ) : (
                <Utensils aria-hidden="true" size={24} strokeWidth={1.7} />
              )}
            </div>
          </div>
        )}
        <div className="absolute left-3 top-3">
          <Pill tone={platillo.disponible ? 'success' : 'danger'}>
            {platillo.disponible ? 'Disponible' : 'Agotado'}
          </Pill>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[12px] font-medium uppercase tracking-[0.06em] text-ink-500">{categoriaNombre}</p>
            <h2 className="mt-1 line-clamp-2 min-h-[42px] font-serif text-h2 text-ink-900">{platillo.nombre}</h2>
          </div>
          <div className="shrink-0 text-right font-serif text-[22px] font-semibold leading-none text-ink-900 tnum">
            {formatCurrency(platillo.precio, 0)}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-dashed border-[rgba(42,30,20,0.08)] pt-4">
          <button
            type="button"
            role="switch"
            aria-checked={platillo.disponible}
            aria-label={platillo.disponible ? 'Marcar como agotado' : 'Marcar como disponible'}
            className={clsx(
              'inline-flex h-8 w-[64px] items-center rounded-full p-1 transition duration-150 disabled:cursor-not-allowed disabled:opacity-60',
              platillo.disponible ? 'bg-sage-100' : 'bg-cream-200',
            )}
            disabled={isUpdating}
            title={platillo.disponible ? 'Marcar como agotado' : 'Marcar como disponible'}
            onClick={() => onToggleDisponible(platillo)}
          >
            <span
              className={clsx(
                'grid h-6 w-6 place-items-center rounded-full bg-white shadow-sm-soft transition-transform duration-150',
                platillo.disponible ? 'translate-x-8 text-sage-500' : 'translate-x-0 text-ink-400',
              )}
            >
              {isUpdating ? (
                <Loader2 aria-hidden="true" className="animate-spin" size={13} strokeWidth={1.8} />
              ) : (
                <Power aria-hidden="true" size={13} strokeWidth={1.8} />
              )}
            </span>
          </button>

          <Button type="button" size="sm" variant="ghost" onClick={() => onEdit(platillo)}>
            <Pencil aria-hidden="true" size={14} strokeWidth={1.8} />
            Editar
          </Button>
        </div>
      </div>
    </article>
  );
}
