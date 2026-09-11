import type { IScannerControls } from '@zxing/browser';
import { Camera, CheckCircle2, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { getErrorDetail } from '@/api/errors';
import { validarReserva } from '@/api/reservas';
import type { Reserva } from '@/types/api';


function extractCode(raw: string): string {
  const value = raw.trim();
  try {
    const url = new URL(value);
    return url.pathname.split('/').filter(Boolean).at(-1) ?? value;
  } catch {
    return value.toUpperCase();
  }
}

export function ReservaScanner({ open, onClose }: { open: boolean; onClose: () => void }): JSX.Element | null {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const handledRef = useRef(false);
  const [code, setCode] = useState('');
  const [reservation, setReservation] = useState<Reserva | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);

  const stopScanner = useCallback(() => {
    controlsRef.current?.stop();
    controlsRef.current = null;
    const stream = videoRef.current?.srcObject;
    if (stream instanceof MediaStream) stream.getTracks().forEach((track) => track.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
    setScanning(false);
  }, []);

  const validate = useCallback(async (raw: string): Promise<void> => {
    const token = extractCode(raw);
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const nextReservation = await validarReserva(token);
      setReservation(nextReservation);
      stopScanner();
    } catch (validationError) {
      setError(getErrorDetail(validationError, 'No se pudo validar la reserva.'));
      handledRef.current = false;
    } finally {
      setLoading(false);
    }
  }, [stopScanner]);

  const startScanner = useCallback(async (): Promise<void> => {
    stopScanner();
    setError(null);
    setReservation(null);
    handledRef.current = false;
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia || !videoRef.current) {
      setError('La cámara requiere HTTPS o localhost. También puedes escribir el folio.');
      return;
    }
    try {
      const { BrowserQRCodeReader } = await import('@zxing/browser');
      const reader = new BrowserQRCodeReader();
      controlsRef.current = await reader.decodeFromConstraints(
        { audio: false, video: { facingMode: { ideal: 'environment' } } },
        videoRef.current,
        (result) => {
          if (!result || handledRef.current) return;
          handledRef.current = true;
          void validate(result.getText());
        },
      );
      setScanning(true);
    } catch {
      setError('No pudimos abrir la cámara. Revisa los permisos o ingresa el folio.');
    }
  }, [stopScanner, validate]);

  useEffect(() => {
    if (!open) stopScanner();
    return stopScanner;
  }, [open, stopScanner]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] grid place-items-end bg-ink-900/45 sm:place-items-center" role="presentation">
      <section className="max-h-[94dvh] w-full overflow-y-auto rounded-t-xl bg-white p-5 shadow-lg sm:max-w-md sm:rounded-xl" role="dialog" aria-modal="true" aria-labelledby="reserva-scanner-title">
        <header className="flex items-start justify-between gap-4">
          <div><p className="text-xs font-semibold uppercase tracking-[0.05em] text-terracotta-500">Recepción</p><h2 id="reserva-scanner-title" className="mt-1 font-serif text-[26px] font-semibold">Validar reserva</h2></div>
          <button type="button" className="grid h-11 w-11 place-items-center rounded-md bg-cream-100 text-ink-500" aria-label="Cerrar" onClick={onClose}><X size={19} /></button>
        </header>

        {reservation ? (
          <div className="mt-6 text-center">
            <CheckCircle2 className="mx-auto text-sage-500" size={56} />
            <h3 className="mt-4 font-serif text-2xl font-semibold">Reserva validada</h3>
            <p className="mt-1 font-mono text-sm font-bold text-terracotta-500">{reservation.folio}</p>
            <div className="mt-5 grid grid-cols-2 gap-3 rounded-md bg-cream-50 p-4 text-left text-sm"><div><span className="text-xs text-ink-400">Cliente</span><strong className="mt-1 block">{reservation.nombre_cliente}</strong></div><div><span className="text-xs text-ink-400">Personas</span><strong className="mt-1 block">{reservation.num_personas}</strong></div><div><span className="text-xs text-ink-400">Mesa</span><strong className="mt-1 block">{reservation.id_mesa}</strong></div><div><span className="text-xs text-ink-400">Estado</span><strong className="mt-1 block capitalize">{reservation.estado}</strong></div></div>
            <button type="button" className="mt-5 min-h-12 w-full rounded-md bg-ink-900 px-4 text-sm font-semibold text-white" onClick={onClose}>Continuar</button>
          </div>
        ) : (
          <>
            <div className="relative mt-5 aspect-[4/3] overflow-hidden rounded-lg bg-ink-900">
              <video ref={videoRef} className="h-full w-full object-cover" muted playsInline />
              {!scanning ? <div className="absolute inset-0 grid place-items-center text-center text-white"><div><Camera className="mx-auto text-terracotta-400" size={32} /><button type="button" className="mt-4 min-h-11 rounded-md bg-terracotta-500 px-5 text-sm font-semibold" onClick={() => void startScanner()}>Activar cámara</button></div></div> : null}
            </div>
            <div className="mt-4">
              <label htmlFor="reserva-folio" className="text-xs font-semibold uppercase text-ink-500">Folio o código de reserva</label>
              <div className="mt-2 flex gap-2"><input id="reserva-folio" value={code} className="h-12 min-w-0 flex-1 rounded-md border-[rgba(31,26,20,0.14)] font-mono uppercase" placeholder="UTTOF-R-000001" onChange={(event) => setCode(event.target.value.toUpperCase())} /><button type="button" disabled={loading || code.trim().length < 8} className="min-h-12 rounded-md bg-ink-900 px-4 text-sm font-semibold text-white disabled:opacity-50" onClick={() => void validate(code)}>{loading ? 'Validando...' : 'Validar'}</button></div>
            </div>
            {error ? <p className="mt-4 rounded-md bg-wine-100 px-3 py-2 text-sm text-wine-600">{error}</p> : null}
          </>
        )}
      </section>
    </div>
  );
}
