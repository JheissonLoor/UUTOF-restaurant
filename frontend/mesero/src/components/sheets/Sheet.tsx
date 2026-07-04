import { X } from 'lucide-react';
import type { ReactNode } from 'react';

interface SheetProps {
  title: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

export function Sheet({ title, open, onClose, children }: SheetProps): JSX.Element | null {
  if (!open) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-end bg-ink-900/35" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" aria-label="Cerrar" className="absolute inset-0 cursor-default" onClick={onClose} />
      <section className="relative max-h-[86dvh] w-full overflow-hidden rounded-t-[22px] bg-cream-50 shadow-lg-soft">
        <div className="mx-auto mt-2 h-1.5 w-12 rounded-full bg-ink-200" />
        <header className="flex items-center justify-between gap-3 border-b border-[rgba(31,26,20,0.08)] px-4 py-3">
          <h2 className="font-serif text-[20px] font-semibold text-ink-900">{title}</h2>
          <button type="button" aria-label="Cerrar" className="grid h-11 w-11 place-items-center rounded-full bg-white text-ink-500" onClick={onClose}>
            <X aria-hidden="true" size={18} />
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}
