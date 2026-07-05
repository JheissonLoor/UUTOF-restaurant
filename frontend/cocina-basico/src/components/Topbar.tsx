import { useEffect, useState } from 'react';

import { ChefIcon, UtensilsMark } from '@/components/icons';
import { formatLimaTime } from '@/lib/format';
import type { UsuarioSesion } from '@/types';

interface TopbarProps {
  user: UsuarioSesion | null;
  onLogout: () => void;
}

export function Topbar({ user, onLogout }: TopbarProps): JSX.Element {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-[rgba(31,26,20,0.08)] bg-cream-surface px-7">
      <div className="flex items-center gap-3">
        <div className="grid h-[38px] w-[38px] place-items-center rounded-[12px] bg-coral text-white">
          <UtensilsMark />
        </div>
        <span className="font-serif text-[20px] font-semibold text-ink-900">UTTOF</span>
      </div>

      <div className="ml-4 flex items-center gap-2 rounded-full bg-coral-50 px-4 py-2 text-[13.5px] font-semibold text-coral-600">
        <ChefIcon size={15} />
        Panel de Cocina
      </div>

      <span className="rounded-full border border-[rgba(31,26,20,0.15)] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-400">
        Plan Básico
      </span>

      <div className="flex-1" />

      <span className="font-mono text-[13px] text-ink-500 tnum">{formatLimaTime(now)} - Lima</span>

      <div className="flex items-center gap-2.5 text-sm font-semibold text-ink-900">
        <div className="grid h-8 w-8 place-items-center rounded-full bg-sun-50 text-[13px] font-bold text-sun-600">
          {(user?.nombre ?? 'C').charAt(0).toUpperCase()}
        </div>
        {user?.nombre ?? 'Cocina'}
      </div>

      <button type="button" className="rounded-sm border border-[rgba(31,26,20,0.15)] px-3 py-2 text-[13px] font-semibold text-ink-500 transition hover:bg-cream-bg2" onClick={onLogout}>
        Salir
      </button>
    </header>
  );
}
