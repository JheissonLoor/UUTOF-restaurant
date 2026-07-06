import { useEffect, useRef, useState } from 'react'

import { AlertIcon, MoreIcon, PauseIcon, PlayIcon } from '@/components/icons'

interface TicketMenuProps {
  pausado: boolean
  onPause: () => void
  onReport: () => void
}

export function TicketMenu({ pausado, onPause, onReport }: TicketMenuProps): JSX.Element {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false)
    }
    window.addEventListener('mousedown', handleClick)
    return () => window.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        className="grid h-10 w-10 place-items-center rounded-sm border border-white/[0.16] text-ink-3 transition hover:bg-surface-2 hover:text-ink"
        onClick={() => setOpen((value) => !value)}
        aria-label="Más acciones"
      >
        <MoreIcon size={16} />
      </button>
      {open ? (
        <div className="absolute bottom-12 right-0 z-30 w-56 overflow-hidden rounded-md border border-white/[0.16] bg-bg shadow-[0_18px_60px_-20px_rgba(0,0,0,0.9)]">
          <button
            type="button"
            className="flex w-full items-center gap-2 px-3 py-3 text-left text-sm text-ink-2 transition hover:bg-surface"
            onClick={() => {
              setOpen(false)
              onReport()
            }}
          >
            <AlertIcon size={15} className="text-sun" />
            Reportar falta de insumo
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-2 px-3 py-3 text-left text-sm text-ink-2 transition hover:bg-surface"
            onClick={() => {
              setOpen(false)
              onPause()
            }}
          >
            {pausado ? <PlayIcon size={15} className="text-mint" /> : <PauseIcon size={15} className="text-coral" />}
            {pausado ? 'Reanudar ticket' : 'Pausar ticket'}
          </button>
        </div>
      ) : null}
    </div>
  )
}
