import { Search, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { tabs } from '@/components/navigation';

interface CommandPaletteProps {
  onClose: () => void;
}

export function CommandPalette({ onClose }: CommandPaletteProps): JSX.Element {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();

  const results = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return tabs;

    return tabs.filter((tab) => tab.label.toLowerCase().includes(normalizedQuery));
  }, [query]);

  useEffect(() => {
    inputRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-ink-900/35 px-4 pt-[12vh]" role="presentation">
      <section
        aria-label="Buscar en el panel"
        className="mx-auto w-full max-w-[560px] overflow-hidden rounded-lg border border-[rgba(42,30,20,0.08)] bg-white text-ink-900 shadow-lg-soft"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex h-14 items-center gap-3 border-b border-[rgba(42,30,20,0.08)] px-4">
          <Search aria-hidden="true" size={18} strokeWidth={1.8} className="text-ink-500" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-full min-w-0 flex-1 border-0 bg-transparent p-0 text-sm text-ink-900 placeholder:text-ink-400 focus:ring-0"
            placeholder="Buscar seccion"
            type="search"
          />
          <button
            type="button"
            className="grid h-9 w-9 place-items-center rounded-md text-ink-500 transition hover:bg-cream-100 hover:text-ink-900"
            aria-label="Cerrar busqueda"
            onClick={onClose}
          >
            <X aria-hidden="true" size={18} strokeWidth={1.8} />
          </button>
        </div>
        <div className="max-h-[320px] overflow-y-auto p-2">
          {results.length > 0 ? (
            results.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.path}
                  type="button"
                  className="flex w-full items-center gap-3 rounded-md px-3 py-3 text-left text-sm font-medium text-ink-700 transition hover:bg-cream-100 hover:text-ink-900"
                  onClick={() => {
                    navigate(tab.path);
                    onClose();
                  }}
                >
                  <Icon aria-hidden="true" size={16} strokeWidth={1.8} className="text-ink-500" />
                  {tab.label}
                </button>
              );
            })
          ) : (
            <div className="px-4 py-8 text-center text-sm text-ink-500">No hay resultados.</div>
          )}
        </div>
      </section>
    </div>
  );
}
