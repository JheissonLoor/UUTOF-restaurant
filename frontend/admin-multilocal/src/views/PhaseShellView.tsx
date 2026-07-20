import { TopBar } from '../layout/TopBar';
import type { ViewDefinition } from './viewDefinitions';

interface PhaseShellViewProps {
  view: ViewDefinition;
}

export function PhaseShellView({ view }: PhaseShellViewProps) {
  return (
    <section className="animate-view-in" aria-labelledby={`titulo-${view.slug}`}>
      <TopBar title={view.title} subtitle={view.subtitle} titleId={`titulo-${view.slug}`} />
      <div className="border-t border-[#E7DED3] pt-10">
        <p className="font-mono text-[10px] font-semibold uppercase text-ink4">Sin información disponible</p>
      </div>
    </section>
  );
}
