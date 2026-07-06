import { useEffect, useState } from 'react'

import { BellIcon, BellOffIcon, CheckIcon, FlameIcon, LogOutIcon } from '@/components/icons'
import { useGlobalStats } from '@/state/topbarStats'
import type { UsuarioSesion } from '@/types/api'

interface TopbarProps {
  user: UsuarioSesion | null
  soundEnabled: boolean
  onToggleSound: () => void
  onLogout: () => void
}

export function Topbar({ user, soundEnabled, onToggleSound, onLogout }: TopbarProps): JSX.Element {
  const [now, setNow] = useState(() => new Date())
  const stats = useGlobalStats()

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000)
    return () => window.clearInterval(id)
  }, [])

  return (
    <header className="grid grid-cols-[auto_1fr_auto] items-center gap-7 border-b border-white/[0.08] bg-bg-2 px-[22px]">
      <div className="flex items-center gap-2.5">
        <div className="grid h-8 w-8 place-items-center rounded-[9px] bg-gradient-to-br from-coral to-coral-700 font-serif text-[15px] font-bold text-white shadow-[0_2px_8px_rgba(233,75,51,0.4)]">
          U
        </div>
        <span className="font-serif text-[17px] font-semibold tracking-[0.02em] text-ink">UTTOF</span>
        <span className="ml-2 rounded-full border border-white/[0.16] bg-bg px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-3">
          Cocina · KDS
        </span>
      </div>

      <div className="flex justify-center gap-3">
        <TopbarStat icon={<FlameIcon size={12} />} tone="coral" value={stats.cooking} label="en preparación" />
        <TopbarStat icon={<BellIcon size={12} />} tone="sun" value={stats.newTickets} label="nuevos" />
        <TopbarStat icon={<CheckIcon size={12} />} tone="mint" value={stats.ready} label="listos" />
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="font-serif text-[22px] font-medium leading-none tracking-[-0.01em] tnum">
            {now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className="mt-1 text-[11.5px] font-semibold uppercase tracking-[0.08em] text-ink-3">
            {now.toLocaleDateString('es-PE', { weekday: 'short', day: '2-digit', month: 'short' })}
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-white/[0.16] bg-bg py-1 pl-1 pr-2.5 text-[12.5px] text-ink-2">
          <div className="grid h-[26px] w-[26px] place-items-center rounded-full bg-gradient-to-br from-coral to-coral-700 text-[11px] font-bold text-white">
            {(user?.nombre ?? 'C').slice(0, 1).toUpperCase()}
          </div>
          {user?.nombre ?? 'Chef'}
        </div>
        <button
          type="button"
          className={`grid h-9 w-9 place-items-center rounded-sm border transition ${soundEnabled ? 'border-sun/40 bg-sun/10 text-sun' : 'border-white/[0.08] bg-surface text-ink-3 hover:border-white/[0.16] hover:text-ink'}`}
          onClick={onToggleSound}
          aria-label={soundEnabled ? 'Silenciar sonido' : 'Activar sonido'}
        >
          {soundEnabled ? <BellIcon size={15} /> : <BellOffIcon size={15} />}
        </button>
        <button
          type="button"
          className="grid h-9 w-9 place-items-center rounded-sm border border-white/[0.08] bg-surface text-ink-3 transition hover:border-white/[0.16] hover:text-ink"
          onClick={onLogout}
          aria-label="Cerrar sesión"
        >
          <LogOutIcon size={15} />
        </button>
      </div>
    </header>
  )
}

function TopbarStat({ icon, tone, value, label }: { icon: JSX.Element; tone: 'coral' | 'sun' | 'mint'; value: number; label: string }): JSX.Element {
  const toneClass = {
    coral: 'bg-coral/10 text-coral',
    sun: 'bg-sun/10 text-sun',
    mint: 'bg-mint/10 text-mint',
  }[tone]

  return (
    <div className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-bg px-3.5 py-1.5 text-[13px]">
      <span className={`grid h-[22px] w-[22px] place-items-center rounded-[6px] ${toneClass}`}>{icon}</span>
      <span className="font-serif text-[17px] font-semibold tracking-[-0.01em] tnum">{value}</span>
      <span className="text-xs text-ink-3">{label}</span>
    </div>
  )
}
