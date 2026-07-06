import { MaximizeIcon } from '@/components/icons'

export function FullscreenButton(): JSX.Element {
  async function toggleFullscreen(): Promise<void> {
    if (document.fullscreenElement) {
      await document.exitFullscreen()
    } else {
      await document.documentElement.requestFullscreen()
    }
  }

  return (
    <button type="button" onClick={() => void toggleFullscreen()} className="grid h-9 w-9 place-items-center rounded-sm border border-white/[0.16] text-ink-3 transition hover:text-ink" aria-label="Pantalla completa">
      <MaximizeIcon size={15} />
    </button>
  )
}
