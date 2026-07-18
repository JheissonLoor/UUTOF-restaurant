import { useEffect, useState } from 'react';

import { UtensilsMark } from '@/components/icons';
import { formatLimaTime } from '@/lib/format';
import type { UsuarioSesion } from '@/types';

interface TopbarProps {
  user: UsuarioSesion | null;
  preparingCount: number;
  waitingCount: number;
  readyCount: number;
  onLogout: () => void;
}

export function Topbar({ user, preparingCount, waitingCount, readyCount, onLogout }: TopbarProps): JSX.Element {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 z-20 flex h-[70px] items-center gap-3 border-b border-white/5 bg-[linear-gradient(100deg,#1B1610,#231C15)] px-5 text-cream-bg2 lg:px-7">
      <div className="flex items-center gap-3">
        <div className="grid h-[38px] w-[38px] place-items-center rounded-[12px] bg-coral text-white">
          <UtensilsMark />
        </div>
        <span className="font-serif text-[20px] font-semibold text-cream-bg2">UTTOF</span>
      </div>

      <span className="rounded-full bg-[linear-gradient(135deg,#E8B14A,#B07E1E)] px-2.5 py-1 font-mono text-[10px] font-bold uppercase text-[#221A08]">
        Plan Pro
      </span>

      <div className="ml-3 hidden items-stretch gap-2 md:flex">
        {[
          { label: 'Preparando', value: preparingCount, dot: 'bg-coral' },
          { label: 'En espera', value: waitingCount, dot: 'bg-sun' },
          { label: 'Listos', value: readyCount, dot: 'bg-mint' },
        ].map((stat) => (
          <div key={stat.label} className="flex min-w-[94px] items-center gap-2 rounded-md bg-white/5 px-3 py-2">
            <span className={`h-2 w-2 rounded-full ${stat.dot}`} />
            <div>
              <div className="font-serif text-[19px] font-semibold leading-none text-white">{stat.value}</div>
              <div className="mt-0.5 text-[9px] uppercase text-white/45">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex-1" />

      <span className="hidden items-center gap-2 font-mono text-[10px] text-mint sm:flex">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-mint" />
        Sincroniza c/15s
      </span>

      <span className="hidden font-mono text-[12px] text-white/55 tnum lg:inline">{formatLimaTime(now)} · Lima</span>

      <div className="flex items-center gap-2.5 text-sm font-semibold text-cream-bg2">
        <div className="grid h-8 w-8 place-items-center rounded-full bg-sun-50 text-[13px] font-bold text-sun-600">
          {(user?.nombre ?? 'C').charAt(0).toUpperCase()}
        </div>
        <span className="hidden xl:inline">{user?.nombre ?? 'Cocina'}</span>
      </div>

      <button type="button" className="rounded-sm border border-white/10 px-3 py-2 text-[12px] font-semibold text-white/60 transition hover:bg-white/5 hover:text-white" onClick={onLogout}>
        Salir
      </button>
    </header>
  );
}
