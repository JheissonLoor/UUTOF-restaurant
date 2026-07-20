import type { ViewDefinition } from './viewDefinitions';

interface PhaseShellViewProps {
  view: ViewDefinition;
}

export function PhaseShellView({ view }: PhaseShellViewProps) {
  return (
    <section className="animate-view-in" aria-labelledby={`titulo-${view.slug}`}>
      <h1 id={`titulo-${view.slug}`} className="font-display text-[32px] font-semibold text-ink">
        {view.title}
      </h1>
      <p className="mt-1 text-[13px] text-ink3">{view.subtitle}</p>
      <div className="mt-6 border-t border-[#E7DED3] pt-10">
        <p className="font-mono text-[10px] font-semibold uppercase text-ink4">Sin información disponible</p>
      </div>
    </section>
  );
}
