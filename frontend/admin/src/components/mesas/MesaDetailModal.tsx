import clsx from 'clsx';
import { Clock3, Download, QrCode, ReceiptText, Table2, Users, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useRef, useState } from 'react';

import { mesaStatePresentation } from '@/components/mesas/mesaPresentation';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/format';
import { createMesaQrPayload } from '@/lib/mesaQr';
import type { Mesa, MesaEstado } from '@/types/api';

interface MesaDetailModalProps {
  mesa: Mesa;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (estado: MesaEstado) => Promise<void>;
}

const stateOptions = Object.entries(mesaStatePresentation) as Array<[MesaEstado, (typeof mesaStatePresentation)[MesaEstado]]>;

export function MesaDetailModal({ mesa, isSubmitting, onClose, onSubmit }: MesaDetailModalProps): JSX.Element {
  const modalRef = useRef<HTMLElement | null>(null);
  const qrRef = useRef<SVGSVGElement | null>(null);
  const [nextState, setNextState] = useState<MesaEstado>(mesa.estado);
  const state = mesaStatePresentation[mesa.estado];
  const hasChanges = nextState !== mesa.estado;
  const qrPayload = createMesaQrPayload(mesa.id_mesa);

  useEffect(() => {
    setNextState(mesa.estado);
  }, [mesa.estado]);

  useEffect(() => {
    modalRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        onClose();
        return;
      }

      if (event.key !== 'Tab') return;

      const modalElement = modalRef.current;
      if (!modalElement) return;

      const focusableElements = Array.from(
        modalElement.querySelectorAll<HTMLElement>(
          'button:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => element.offsetParent !== null);

      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  async function handleSubmit(): Promise<void> {
    if (!hasChanges) return;
    await onSubmit(nextState);
  }

  function handleDownloadQr(): void {
    if (!qrRef.current) return;

    const source = new XMLSerializer().serializeToString(qrRef.current);
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `uttof-mesa-${mesa.numero}.svg`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink-900/35 px-4 py-6" role="presentation">
      <section
        ref={modalRef}
        aria-labelledby="mesa-modal-title"
        aria-modal="true"
        className="max-h-[calc(100vh-48px)] w-full max-w-[540px] overflow-y-auto rounded-lg border border-[rgba(42,30,20,0.08)] bg-white p-5 text-ink-900 shadow-lg-soft animate-[count-in_220ms_cubic-bezier(.18,.9,.32,1.18)]"
        role="dialog"
        tabIndex={-1}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={clsx('grid h-11 w-11 place-items-center rounded-md', state.iconClasses)}>
              <Table2 aria-hidden="true" size={21} strokeWidth={1.8} />
            </div>
            <div>
              <h2 id="mesa-modal-title" className="font-serif text-h1">
                Mesa {mesa.numero}
              </h2>
              <p className="mt-0.5 text-sm text-ink-500">{mesa.capacidad} personas de capacidad</p>
            </div>
          </div>
          <button
            type="button"
            className="grid h-9 w-9 place-items-center rounded-md text-ink-500 transition hover:bg-cream-100 hover:text-ink-900"
            aria-label="Cerrar"
            onClick={onClose}
          >
            <X aria-hidden="true" size={18} strokeWidth={1.8} />
          </button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-md border border-[rgba(42,30,20,0.08)] bg-cream-50 p-4">
            <span className="text-label uppercase text-ink-500">Estado actual</span>
            <div className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-ink-900">
              <span className={clsx('h-2 w-2 rounded-full', state.dotClasses)} />
              {state.label}
            </div>
          </div>
          <div className="rounded-md border border-[rgba(42,30,20,0.08)] bg-cream-50 p-4">
            <span className="text-label uppercase text-ink-500">Tiempo en estado</span>
            <div className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-ink-900">
              <Clock3 aria-hidden="true" size={15} strokeWidth={1.8} />
              {mesa.pedido_activo ? `${mesa.pedido_activo.tiempo_min} min` : 'No disponible'}
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-md border border-[rgba(42,30,20,0.08)] p-4">
          <div className="flex items-center gap-2">
            <ReceiptText aria-hidden="true" className="text-terracotta-500" size={18} strokeWidth={1.8} />
            <h3 className="font-serif text-base font-semibold text-ink-900">Pedido activo</h3>
          </div>
          {mesa.pedido_activo ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div>
                <span className="block text-label uppercase text-ink-500">Pedido</span>
                <span className="mt-1 block text-sm font-semibold text-ink-900 tnum">#{mesa.pedido_activo.id_pedido}</span>
              </div>
              <div>
                <span className="block text-label uppercase text-ink-500">Comensales</span>
                <span className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-900 tnum">
                  <Users aria-hidden="true" size={14} strokeWidth={1.8} />
                  {mesa.pedido_activo.comensales}
                </span>
              </div>
              <div>
                <span className="block text-label uppercase text-ink-500">Ticket</span>
                <span className="mt-1 block text-sm font-semibold text-ink-900 tnum">
                  {formatCurrency(mesa.pedido_activo.total)}
                </span>
              </div>
            </div>
          ) : (
            <p className="mt-3 text-sm text-ink-500">No hay un pedido activo asociado a esta mesa.</p>
          )}
        </div>

        <div className="mt-5 border-t border-dashed border-[rgba(42,30,20,0.08)] pt-5">
          <div className="flex items-center gap-2">
            <QrCode aria-hidden="true" className="text-terracotta-500" size={18} strokeWidth={1.8} />
            <h3 className="font-serif text-base font-semibold text-ink-900">QR de acceso del cliente</h3>
          </div>
          <div className="mt-4 grid items-center gap-4 sm:grid-cols-[148px_minmax(0,1fr)]">
            <div className="grid h-[148px] w-[148px] place-items-center rounded-md border border-[rgba(42,30,20,0.08)] bg-white p-2">
              <QRCodeSVG
                ref={qrRef}
                aria-label={`Código QR de acceso para la mesa ${mesa.numero}`}
                bgColor="#FFFFFF"
                fgColor="#2A1E14"
                level="M"
                marginSize={1}
                size={132}
                title={`UTTOF Mesa ${mesa.numero}`}
                value={qrPayload}
              />
            </div>
            <div className="min-w-0">
              <p className="text-sm leading-5 text-ink-500">
                Coloca este código en la mesa para que el comensal inicie su visita desde la app Cliente.
              </p>
              <code className="mt-2 block truncate rounded-sm bg-cream-100 px-2.5 py-2 text-xs text-ink-700">
                {qrPayload}
              </code>
              <Button className="mt-3" type="button" variant="ghost" onClick={handleDownloadQr}>
                <Download aria-hidden="true" size={15} strokeWidth={1.8} />
                Descargar SVG
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-5">
          <label className="mb-1.5 block text-label uppercase text-ink-500" htmlFor="mesa-estado">
            Cambiar estado
          </label>
          <select
            id="mesa-estado"
            value={nextState}
            className="h-10 w-full rounded-md border border-[rgba(42,30,20,0.14)] px-3.5 text-sm text-ink-900 transition focus:border-terracotta-500 focus:ring-4 focus:ring-terracotta-100"
            onChange={(event) => setNextState(event.target.value as MesaEstado)}
          >
            {stateOptions.map(([value, option]) => (
              <option key={value} value={value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 border-t border-dashed border-[rgba(42,30,20,0.08)] pt-5 sm:flex-row sm:justify-end">
          <Button type="button" variant="ghost" disabled={isSubmitting} onClick={onClose}>
            Cancelar
          </Button>
          <Button type="button" variant="primary" loading={isSubmitting} disabled={!hasChanges} onClick={handleSubmit}>
            {isSubmitting ? 'Guardando...' : 'Guardar estado'}
          </Button>
        </div>
      </section>
    </div>
  );
}
