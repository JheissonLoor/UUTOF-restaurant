import { Check, ChefHat, ShoppingCart, Users, X } from 'lucide-react';
import type { AccionRecomendacion, RecomendacionIa, TipoRecomendacion } from '../../types/multilocal';

interface RecommendationListProps {
  items?: RecomendacionIa[];
  loading?: boolean;
  pendingId?: string | null;
  onAction: (item: RecomendacionIa, action: AccionRecomendacion) => void;
}

const iconByType: Record<TipoRecomendacion, typeof ShoppingCart> = {
  comprar: ShoppingCart,
  staff: Users,
  menu: ChefHat,
};

const iconClassByType: Record<TipoRecomendacion, string> = {
  comprar: 'bg-coral/10 text-coral-dark',
  staff: 'bg-sky/10 text-sky-dark',
  menu: 'bg-sun/15 text-sun-dark',
};

export function RecommendationList({
  items = [],
  loading = false,
  pendingId = null,
  onAction,
}: RecommendationListProps) {
  return (
    <section className="min-h-[340px] rounded-card border border-[#E7DED3] bg-surface p-5 shadow-card">
      <header className="mb-3">
        <h3 className="font-display text-[18px] font-semibold text-ink">Acciones recomendadas</h3>
        <p className="mt-1 text-xs text-ink4">Decisiones sugeridas con información operativa actual</p>
      </header>

      <div className="divide-y divide-[#EEE6DC]">
        {loading
          ? [1, 2, 3].map((row) => (
              <div key={row} className="flex animate-pulse gap-3 py-4">
                <span className="h-9 w-9 rounded-card bg-bg2" />
                <span className="flex-1 space-y-2"><span className="block h-4 w-4/5 rounded bg-bg2" /><span className="block h-3 w-3/5 rounded bg-bg2" /></span>
              </div>
            ))
          : null}
        {!loading && items.length === 0 ? (
          <div className="flex min-h-[230px] items-center justify-center px-4 text-center text-sm text-ink3">
            No hay acciones pendientes para esta selección.
          </div>
        ) : null}
        {!loading
          ? items.map((item) => {
              const Icon = iconByType[item.tipo];
              const isPending = pendingId === item.id;
              return (
                <article key={item.id} className="flex gap-3 py-4 first:pt-2 last:pb-1">
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-card ${iconClassByType[item.tipo]}`}>
                    <Icon size={17} aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold leading-5 text-ink">{item.texto}</p>
                    <p className="mt-0.5 text-[11px] leading-4 text-ink4">{item.impacto}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={Boolean(pendingId)}
                        onClick={() => onAction(item, 'aceptar')}
                        className="flex h-9 items-center gap-1.5 rounded-card bg-ink px-3 text-[11px] font-semibold text-white hover:bg-ink2 disabled:opacity-50"
                      >
                        <Check size={14} aria-hidden="true" /> {isPending ? 'Procesando...' : 'Aplicar'}
                      </button>
                      <button
                        type="button"
                        disabled={Boolean(pendingId)}
                        onClick={() => onAction(item, 'descartar')}
                        className="flex h-9 items-center gap-1.5 rounded-card border border-[#DED4C8] px-3 text-[11px] font-semibold text-ink3 hover:bg-bg disabled:opacity-50"
                      >
                        <X size={14} aria-hidden="true" /> Descartar
                      </button>
                    </div>
                  </div>
                </article>
              );
            })
          : null}
      </div>
    </section>
  );
}
