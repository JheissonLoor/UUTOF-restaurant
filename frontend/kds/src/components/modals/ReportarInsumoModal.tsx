import { useMemo, useState } from 'react'

import type { RuntimeTicket } from '@/lib/tickets'

interface ReportarInsumoModalProps {
  ticket: RuntimeTicket
  onClose: () => void
  onSubmit: (idDetalle: number, nota: string) => Promise<void>
}

export function ReportarInsumoModal({ ticket, onClose, onSubmit }: ReportarInsumoModalProps): JSX.Element {
  const firstItemId = useMemo(() => ticket.items.find((item) => item.id_detalle !== undefined)?.id_detalle ?? 0, [ticket.items])
  const [idDetalle, setIdDetalle] = useState(firstItemId)
  const [nota, setNota] = useState('Falta insumo para completar el plato')
  const [isSaving, setIsSaving] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    if (!idDetalle) return
    setIsSaving(true)
    try {
      await onSubmit(idDetalle, nota)
      onClose()
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 px-6">
      <form onSubmit={(event) => void handleSubmit(event)} className="w-full max-w-[460px] rounded-lg border border-white/[0.16] bg-surface p-5 shadow-[0_24px_80px_-28px_rgba(0,0,0,1)]">
        <h2 className="font-serif text-[26px] font-semibold">Reportar falta de insumo</h2>
        <p className="mt-1 text-sm text-ink-3">Ticket #{ticket.num} · {ticket.mesa}</p>

        <label className="mt-5 block text-xs font-semibold uppercase tracking-[0.08em] text-ink-3" htmlFor="item">Item afectado</label>
        <select
          id="item"
          value={idDetalle}
          onChange={(event) => setIdDetalle(Number(event.target.value))}
          className="mt-2 h-12 w-full rounded-sm border border-white/[0.12] bg-bg px-3 text-sm text-ink outline-none focus:border-coral"
        >
          {ticket.items.filter((item) => item.id_detalle !== undefined).map((item) => (
            <option key={item.id} value={item.id_detalle}>{item.qty}x {item.nombre}</option>
          ))}
        </select>

        <label className="mt-4 block text-xs font-semibold uppercase tracking-[0.08em] text-ink-3" htmlFor="nota">Nota</label>
        <textarea
          id="nota"
          value={nota}
          onChange={(event) => setNota(event.target.value)}
          className="mt-2 min-h-28 w-full resize-none rounded-sm border border-white/[0.12] bg-bg px-3 py-3 text-sm text-ink outline-none focus:border-coral"
          maxLength={500}
        />

        <div className="mt-5 flex justify-end gap-2">
          <button type="button" className="h-11 rounded-sm border border-white/[0.16] px-4 text-sm font-semibold text-ink-2" onClick={onClose}>Cancelar</button>
          <button type="submit" disabled={isSaving || nota.trim().length < 3} className="h-11 rounded-sm bg-coral px-4 text-sm font-semibold text-white disabled:opacity-60">
            {isSaving ? 'Enviando...' : 'Notificar'}
          </button>
        </div>
      </form>
    </div>
  )
}
