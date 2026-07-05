import { useState } from 'react';

import { checkinMesa } from '@/api/cliente';
import { getErrorDetail } from '@/api/errors';
import { CameraIcon, CheckIcon, TableIcon } from '@/components/icons';
import type { MesaSession } from '@/types';

export function ScanQR({ onCheckedIn }: { onCheckedIn: (mesa: MesaSession) => void }): JSX.Element {
  const [mesaId, setMesaId] = useState('1');
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckin(id: number): Promise<void> {
    setError(null);
    setIsChecking(true);
    try {
      const mesa = await checkinMesa(id);
      onCheckedIn(mesa);
    } catch (checkinError) {
      const message = getErrorDetail(checkinError, 'No se pudo hacer check-in.');
      if (message.toLowerCase().includes('no esta libre')) {
        onCheckedIn({ id_mesa: id, numero: id, zona: 'salon', capacidad: 4 });
        return;
      }
      setError(message);
    } finally {
      setIsChecking(false);
    }
  }

  return (
    <main className="relative min-h-[100dvh] overflow-hidden bg-ink-900 text-white" data-screen-label="00 Escanear QR mesa">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,rgba(233,75,51,0.32),transparent_18rem),linear-gradient(180deg,rgba(31,26,20,0.35),rgba(31,26,20,0.95))]" />
      <div className="relative mx-auto flex min-h-[100dvh] max-w-[440px] flex-col px-6 py-6">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/55">UTTOF Cliente</p>
            <h1 className="mt-1 font-serif text-2xl font-semibold">Escanear mesa</h1>
          </div>
          <div className="grid h-11 w-11 place-items-center rounded-full bg-white/10">
            <CameraIcon size={19} />
          </div>
        </header>

        <section className="flex flex-1 flex-col items-center justify-center">
          <button type="button" className="relative grid h-72 w-72 place-items-center rounded-[34px] border border-white/18 bg-white/8 shadow-[0_28px_80px_-38px_rgba(255,255,255,0.5)]" onClick={() => void handleCheckin(Number(mesaId))}>
            <span className="absolute left-5 top-5 h-12 w-12 rounded-tl-[24px] border-l-4 border-t-4 border-coral" />
            <span className="absolute right-5 top-5 h-12 w-12 rounded-tr-[24px] border-r-4 border-t-4 border-coral" />
            <span className="absolute bottom-5 left-5 h-12 w-12 rounded-bl-[24px] border-b-4 border-l-4 border-coral" />
            <span className="absolute bottom-5 right-5 h-12 w-12 rounded-br-[24px] border-b-4 border-r-4 border-coral" />
            <span className="absolute h-1 w-52 rounded-full bg-coral shadow-[0_0_18px_rgba(233,75,51,0.85)] [animation:scan-line_2.2s_ease-in-out_infinite]" />
            <div className="grid h-44 w-44 place-items-center rounded-lg bg-white p-3 text-ink-900">
              <div className="grid h-full w-full grid-cols-5 gap-1">
                {Array.from({ length: 25 }).map((_, index) => (
                  <span key={index} className={(index * 7 + 3) % 4 === 0 ? 'rounded-[2px] bg-ink-900' : 'rounded-[2px] bg-ink-900/10'} />
                ))}
              </div>
            </div>
          </button>

          <div className="mt-8 text-center">
            <h2 className="font-serif text-[28px] font-semibold">Apunta al código de tu mesa</h2>
            <p className="mx-auto mt-2 max-w-[310px] text-sm leading-6 text-white/65">Encuéntralo en el centro de tu mesa. En demo puedes tocar el QR para continuar.</p>
          </div>
        </section>

        <footer className="space-y-3 pb-2">
          <div className="rounded-xl bg-white/10 p-3">
            <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-white/60" htmlFor="mesa-manual">
              <TableIcon size={13} />
              Número de mesa
            </label>
            <div className="flex gap-2">
              <input id="mesa-manual" type="number" min={1} value={mesaId} onChange={(event) => setMesaId(event.target.value)} className="h-12 min-w-0 flex-1 rounded-md border-white/10 bg-white px-4 text-ink-900 focus:border-coral focus:ring-coral-50" />
              <button type="button" disabled={isChecking || Number(mesaId) < 1} className="flex min-h-12 items-center gap-2 rounded-md bg-coral px-4 text-sm font-semibold text-white disabled:opacity-60" onClick={() => void handleCheckin(Number(mesaId))}>
                <CheckIcon size={15} />
                Entrar
              </button>
            </div>
          </div>
          {error ? <div className="rounded-md bg-coral-50 px-4 py-3 text-sm text-coral-700">{error}</div> : null}
          <p className="text-center text-xs text-white/45">UTTOF · Av. La Mar 1234, Miraflores</p>
        </footer>
      </div>
    </main>
  );
}
