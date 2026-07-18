import type { IScannerControls } from '@zxing/browser';
import { useCallback, useEffect, useRef, useState } from 'react';

import { checkinMesa } from '@/api/cliente';
import { getErrorDetail } from '@/api/errors';
import { CameraIcon, CheckIcon, CloseIcon, TableIcon } from '@/components/icons';
import { parseMesaQrPayload } from '@/lib/mesaQr';
import type { MesaSession } from '@/types';

type ScannerState = 'idle' | 'starting' | 'scanning' | 'checking' | 'error';

function getCameraError(error: unknown): string {
  if (!window.isSecureContext) {
    return 'La cámara necesita HTTPS. En desarrollo también funciona desde localhost o 127.0.0.1.';
  }
  if (error instanceof DOMException) {
    if (error.name === 'NotAllowedError' || error.name === 'SecurityError') {
      return 'El permiso de cámara fue rechazado. Habilítalo en la configuración del navegador o ingresa la mesa manualmente.';
    }
    if (error.name === 'NotFoundError') return 'No se encontró una cámara disponible en este dispositivo.';
    if (error.name === 'NotReadableError') return 'La cámara está siendo utilizada por otra aplicación.';
    if (error.name === 'OverconstrainedError') return 'La cámara disponible no admite la configuración solicitada.';
  }
  return 'No pudimos iniciar la cámara. Revisa los permisos del navegador e inténtalo nuevamente.';
}

export function ScanQR({ onCheckedIn }: { onCheckedIn: (mesa: MesaSession) => void }): JSX.Element {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const handledCodeRef = useRef(false);
  const [mesaId, setMesaId] = useState('');
  const [scannerState, setScannerState] = useState<ScannerState>('idle');
  const [error, setError] = useState<string | null>(null);

  const stopScanner = useCallback(() => {
    controlsRef.current?.stop();
    controlsRef.current = null;
    const stream = videoRef.current?.srcObject;
    if (stream instanceof MediaStream) stream.getTracks().forEach((track) => track.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const handleCheckin = useCallback(async (id: number): Promise<boolean> => {
    setError(null);
    setScannerState('checking');
    try {
      const mesa = await checkinMesa(id);
      stopScanner();
      onCheckedIn(mesa);
      return true;
    } catch (checkinError) {
      setError(getErrorDetail(checkinError, 'No se pudo hacer check-in en esta mesa.'));
      setScannerState('error');
      return false;
    }
  }, [onCheckedIn, stopScanner]);

  const startScanner = useCallback(async (): Promise<void> => {
    stopScanner();
    handledCodeRef.current = false;
    setError(null);

    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      setScannerState('error');
      setError(getCameraError(new Error('MediaDevices unavailable')));
      return;
    }
    if (!videoRef.current) return;

    setScannerState('starting');

    try {
      const { BrowserQRCodeReader } = await import('@zxing/browser');
      const reader = new BrowserQRCodeReader(undefined, {
        delayBetweenScanAttempts: 250,
        delayBetweenScanSuccess: 800,
      });
      const controls = await reader.decodeFromConstraints(
        {
          audio: false,
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        },
        videoRef.current,
        (result, _error, controls) => {
          if (!result || handledCodeRef.current) return;
          const id = parseMesaQrPayload(result.getText());
          if (!id) {
            setError('Este código no pertenece a una mesa de UTTOF. Busca el QR ubicado sobre la mesa.');
            return;
          }

          handledCodeRef.current = true;
          controls.stop();
          void handleCheckin(id).then((success) => {
            if (!success) handledCodeRef.current = false;
          });
        },
      );
      controlsRef.current = controls;
      setScannerState('scanning');
    } catch (cameraError) {
      stopScanner();
      setScannerState('error');
      setError(getCameraError(cameraError));
    }
  }, [handleCheckin, stopScanner]);

  useEffect(() => stopScanner, [stopScanner]);

  const isCameraActive = scannerState === 'starting' || scannerState === 'scanning' || scannerState === 'checking';
  const isBusy = scannerState === 'checking';

  function handleStop(): void {
    stopScanner();
    handledCodeRef.current = false;
    setScannerState('idle');
    setError(null);
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

        <section className="flex flex-1 flex-col items-center justify-center py-7">
          <div className="relative h-72 w-72 overflow-hidden rounded-[34px] border border-white/18 bg-black shadow-[0_28px_80px_-38px_rgba(255,255,255,0.5)]">
            <video
              ref={videoRef}
              aria-label="Vista previa de la cámara"
              className={`h-full w-full object-cover transition-opacity ${isCameraActive ? 'opacity-100' : 'opacity-0'}`}
              muted
              playsInline
            />

            {!isCameraActive ? (
              <div className="absolute inset-0 grid place-items-center bg-white/8 px-8 text-center">
                <div>
                  <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-white/10 text-coral">
                    <CameraIcon size={29} />
                  </div>
                  <p className="mt-4 text-sm font-semibold">Usaremos la cámara tras tu permiso</p>
                  <button type="button" className="mt-4 min-h-11 rounded-md bg-coral px-5 text-sm font-semibold text-white" onClick={() => void startScanner()}>
                    Activar cámara
                  </button>
                </div>
              </div>
            ) : null}

            <span className="pointer-events-none absolute left-5 top-5 h-12 w-12 rounded-tl-[24px] border-l-4 border-t-4 border-coral" />
            <span className="pointer-events-none absolute right-5 top-5 h-12 w-12 rounded-tr-[24px] border-r-4 border-t-4 border-coral" />
            <span className="pointer-events-none absolute bottom-5 left-5 h-12 w-12 rounded-bl-[24px] border-b-4 border-l-4 border-coral" />
            <span className="pointer-events-none absolute bottom-5 right-5 h-12 w-12 rounded-br-[24px] border-b-4 border-r-4 border-coral" />
            {scannerState === 'scanning' ? <span className="pointer-events-none absolute left-1/2 top-1/2 h-1 w-52 -translate-x-1/2 rounded-full bg-coral shadow-[0_0_18px_rgba(233,75,51,0.85)] [animation:scan-line_2.2s_ease-in-out_infinite]" /> : null}
            {isBusy ? <div className="absolute inset-0 grid place-items-center bg-ink-900/75 text-sm font-semibold">Confirmando mesa...</div> : null}
          </div>

          <div className="mt-6 text-center">
            <h2 className="font-serif text-[28px] font-semibold">Apunta al código de tu mesa</h2>
            <p className="mx-auto mt-2 max-w-[320px] text-sm leading-6 text-white/65">
              {scannerState === 'starting' ? 'Solicitando acceso a la cámara...'
                : scannerState === 'scanning' ? 'Buscando un QR válido de UTTOF...'
                  : 'Encuéntralo en el centro de tu mesa.'}
            </p>
            {scannerState === 'scanning' ? (
              <button type="button" className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-md bg-white/10 px-4 text-sm font-semibold" onClick={handleStop}>
                <CloseIcon size={15} />
                Detener cámara
              </button>
            ) : null}
          </div>
        </section>

        <footer className="space-y-3 pb-2">
          {error ? (
            <div className="rounded-md bg-coral-50 px-4 py-3 text-sm leading-5 text-coral-700" role="alert">
              {error}
              {scannerState === 'error' ? (
                <button type="button" className="mt-2 block min-h-11 font-semibold underline underline-offset-4" onClick={() => void startScanner()}>
                  Reintentar cámara
                </button>
              ) : null}
            </div>
          ) : null}

          <div className="rounded-xl bg-white/10 p-3">
            <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-white/60" htmlFor="mesa-manual">
              <TableIcon size={13} />
              Ingreso manual
            </label>
            <div className="flex gap-2">
              <input
                id="mesa-manual"
                type="number"
                inputMode="numeric"
                min={1}
                placeholder="N.º de mesa"
                value={mesaId}
                className="h-12 min-w-0 flex-1 rounded-md border-white/10 bg-white px-4 text-ink-900 focus:border-coral focus:ring-coral-50"
                onChange={(event) => setMesaId(event.target.value)}
              />
              <button
                type="button"
                disabled={isBusy || Number(mesaId) < 1}
                className="flex min-h-12 items-center gap-2 rounded-md bg-coral px-4 text-sm font-semibold text-white disabled:opacity-60"
                onClick={() => void handleCheckin(Number(mesaId))}
              >
                <CheckIcon size={15} />
                Entrar
              </button>
            </div>
          </div>
          <p className="text-center text-xs text-white/45">UTTOF · Av. La Mar 1234, Miraflores</p>
        </footer>
      </div>
    </main>
  );
}
