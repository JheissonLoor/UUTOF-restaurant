import { ArrowIcon, CheckIcon, MenuIcon, TableIcon } from '@/components/icons';
import type { MesaSession } from '@/types';

export function CheckinConfirm({ mesa, onOpenMenu, onRescan }: { mesa: MesaSession; onOpenMenu: () => void; onRescan: () => void }): JSX.Element {
  const steps = ['Explora la carta', 'Tu orden va directo a cocina', 'Sigue tu pedido en vivo', 'Pide la cuenta al final'];

  return (
    <main className="min-h-[100dvh] bg-cream-bg px-5 py-8 text-ink-900" data-screen-label="01 Confirmacion mesa">
      <div className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-[440px] flex-col">
        <section className="text-center">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-mint-50 text-mint-600 shadow-soft">
            <CheckIcon size={38} />
          </div>
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.14em] text-mint-600">Check-in confirmado</p>
          <h1 className="mt-2 font-serif text-[38px] font-semibold leading-[1.05] text-ink-900">
            Estás en la
            <br />
            <em className="text-coral-600">Mesa {mesa.numero}</em>
          </h1>
        </section>

        <section className="mt-7 rounded-2xl bg-ink-900 p-4 text-white shadow-soft">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg bg-white/8 p-3">
              <div className="text-[11px] uppercase tracking-[0.1em] text-white/45">Zona</div>
              <div className="mt-1 font-serif text-lg font-semibold capitalize">{mesa.zona}</div>
            </div>
            <div className="rounded-lg bg-white/8 p-3">
              <div className="text-[11px] uppercase tracking-[0.1em] text-white/45">Mesa</div>
              <div className="mt-1 font-serif text-lg font-semibold">#{mesa.numero}</div>
            </div>
            <div className="rounded-lg bg-white/8 p-3">
              <div className="text-[11px] uppercase tracking-[0.1em] text-white/45">Cap.</div>
              <div className="mt-1 font-serif text-lg font-semibold">{mesa.capacidad}</div>
            </div>
          </div>
        </section>

        <section className="mt-5 space-y-3">
          {steps.map((step, index) => (
            <div key={step} className="flex items-center gap-3 rounded-lg border border-[rgba(31,26,20,0.08)] bg-cream-surface p-3 shadow-soft">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-coral-50 font-mono text-xs font-bold text-coral-600">{index + 1}</span>
              <span className="text-sm font-semibold text-ink-700">{step}</span>
            </div>
          ))}
        </section>

        <footer className="mt-auto pt-7">
          <button type="button" className="flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-coral px-4 text-sm font-semibold text-white shadow-[0_8px_20px_-8px_rgba(233,75,51,0.5)]" onClick={onOpenMenu}>
            <MenuIcon size={17} />
            Ver la carta
            <ArrowIcon size={15} />
          </button>
          <button type="button" className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-sm text-sm font-semibold text-ink-500" onClick={onRescan}>
            <TableIcon size={15} />
            ¿Mesa equivocada? Escanear de nuevo
          </button>
        </footer>
      </div>
    </main>
  );
}
