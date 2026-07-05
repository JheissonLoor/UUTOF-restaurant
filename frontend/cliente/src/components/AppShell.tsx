import { BagIcon, CloseIcon, TableIcon } from '@/components/icons';
import { TabBar } from '@/components/TabBar';
import type { AppTab, MesaSession } from '@/types';

interface AppShellProps {
  activeTab: AppTab;
  cartCount: number;
  mesa: MesaSession;
  children: React.ReactNode;
  onTabChange: (tab: AppTab) => void;
  onOpenCart: () => void;
  onResetMesa: () => void;
}

export function AppShell({ activeTab, cartCount, mesa, children, onTabChange, onOpenCart, onResetMesa }: AppShellProps): JSX.Element {
  return (
    <div className="mx-auto min-h-[100dvh] max-w-[440px] bg-cream-bg text-ink-900 shadow-[0_0_0_1px_rgba(31,26,20,0.06)]">
      <header className="sticky top-0 z-30 border-b border-[rgba(31,26,20,0.08)] bg-cream-surface/95 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-md bg-coral font-serif text-lg font-bold text-white">U</div>
          <div className="min-w-0 flex-1">
            <div className="font-serif text-[20px] font-semibold leading-none">UTTOF</div>
            <div className="mt-1 flex items-center gap-1 text-xs font-medium text-ink-500">
              <TableIcon size={12} />
              Mesa {mesa.numero} · {mesa.zona}
            </div>
          </div>
          <button type="button" className="relative grid h-11 w-11 place-items-center rounded-sm bg-coral-50 text-coral-600" onClick={onOpenCart} aria-label="Abrir carrito">
            <BagIcon size={19} />
            {cartCount > 0 ? <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-coral px-1 font-mono text-[10px] font-bold text-white">{cartCount}</span> : null}
          </button>
          <button type="button" className="grid h-11 w-11 place-items-center rounded-sm border border-[rgba(31,26,20,0.08)] text-ink-400" onClick={onResetMesa} aria-label="Cambiar mesa">
            <CloseIcon size={18} />
          </button>
        </div>
      </header>
      <main className="px-4 pb-28 pt-5">{children}</main>
      <TabBar active={activeTab} onChange={onTabChange} />
    </div>
  );
}
