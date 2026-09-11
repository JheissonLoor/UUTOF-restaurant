import { useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { QRCodeSVG } from 'qrcode.react';
import { Link, useParams } from 'react-router-dom';

import { getConfiguracionPublica, getMisReservas } from '@/api/cliente';
import { useAuth } from '@/auth/useAuth';
import { CalendarIcon, CameraIcon, CheckIcon } from '@/components/icons';
import { formatLimaDateTime } from '@/lib/format';


export function ReservaConfirmPage(): JSX.Element {
  const { token = '' } = useParams();
  const { isAuthenticated, isGuest } = useAuth();
  const qrRef = useRef<SVGSVGElement | null>(null);
  const [shareMessage, setShareMessage] = useState<string | null>(null);
  const reservationsQuery = useQuery({ queryKey: ['cliente', 'reservas', 'mias'], queryFn: getMisReservas, enabled: isAuthenticated && !isGuest });
  const configQuery = useQuery({ queryKey: ['cliente', 'configuracion-publica'], queryFn: getConfiguracionPublica });
  const reservation = useMemo(() => reservationsQuery.data?.find((item) => item.qr_url.endsWith(`/${token}`)), [reservationsQuery.data, token]);

  if (!isAuthenticated || isGuest) {
    return <main className="grid min-h-[100dvh] place-items-center bg-cream-bg px-5 text-center"><div><h1 className="font-serif text-3xl font-semibold">Tu reserva está protegida</h1><p className="mt-2 text-sm text-ink-500">Inicia sesión para mostrar el QR.</p><Link to="/login" className="mt-5 inline-flex min-h-12 items-center rounded-md bg-coral px-5 text-sm font-semibold text-white">Iniciar sesión</Link></div></main>;
  }

  function downloadQr(): void {
    if (!qrRef.current || !reservation) return;
    const source = new XMLSerializer().serializeToString(qrRef.current);
    const url = URL.createObjectURL(new Blob([source], { type: 'image/svg+xml;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `${reservation.folio}.svg`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function addCalendar(): void {
    if (!reservation) return;
    const start = new Date(reservation.hora_reserva);
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
    const stamp = (date: Date) => date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
    const location = configQuery.data?.restaurante.direccion ?? 'UTTOF Restaurante, Lima';
    const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'BEGIN:VEVENT', `UID:${reservation.folio}@uttof.pe`, `DTSTART:${stamp(start)}`, `DTEND:${stamp(end)}`, 'SUMMARY:Reserva en UTTOF Restaurante', `LOCATION:${location}`, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `${reservation.folio}.ics`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function shareReservation(): Promise<void> {
    if (!reservation) return;
    const shareData = {
      title: `Reserva ${reservation.folio} en UTTOF`,
      text: `Reserva ${reservation.folio} para ${reservation.num_personas} personas en UTTOF.`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setShareMessage('Reserva compartida.');
      } else {
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        setShareMessage('Enlace copiado.');
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      setShareMessage('No se pudo compartir.');
    }
  }

  if (reservationsQuery.isLoading) return <main className="grid min-h-[100dvh] place-items-center bg-cream-bg text-sm text-ink-500">Buscando tu reserva...</main>;
  if (!reservation) return <main className="grid min-h-[100dvh] place-items-center bg-cream-bg px-5 text-center"><div><h1 className="font-serif text-3xl font-semibold">Reserva no encontrada</h1><Link to="/reservar" className="mt-5 inline-flex min-h-12 items-center rounded-md bg-coral px-5 text-sm font-semibold text-white">Ver mis reservas</Link></div></main>;

  return (
    <main className="mx-auto min-h-[100dvh] max-w-[480px] bg-cream-bg px-5 py-8 text-ink-900">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-mint-50 text-mint-600"><CheckIcon size={30} /></div>
      <h1 className="mt-5 text-center font-serif text-[36px] font-semibold">Reserva confirmada</h1>
      <p className="mt-2 text-center font-mono text-sm font-bold text-coral-600">{reservation.folio}</p>
      <section className="mt-6 rounded-xl bg-cream-surface p-5 shadow-soft">
        <div className="mx-auto grid h-[220px] w-[220px] place-items-center rounded-md border border-[rgba(31,26,20,0.08)] bg-white p-3">
          <QRCodeSVG ref={qrRef} value={reservation.qr_url} size={190} level="M" marginSize={1} title={`Reserva ${reservation.folio}`} />
        </div>
        <p className="mt-4 text-center text-sm text-ink-500">Muéstralo al personal al llegar. Después escanea el QR de tu mesa para comenzar el pedido.</p>
        <div className="mt-5 grid grid-cols-2 gap-3 rounded-md bg-cream-bg2 p-4 text-sm">
          <div><span className="block text-xs text-ink-400">Fecha y hora</span><strong className="mt-1 block">{formatLimaDateTime(reservation.hora_reserva)}</strong></div>
          <div><span className="block text-xs text-ink-400">Personas</span><strong className="mt-1 block">{reservation.num_personas}</strong></div>
          <div><span className="block text-xs text-ink-400">Mesa</span><strong className="mt-1 block">{reservation.id_mesa}</strong></div>
          <div><span className="block text-xs text-ink-400">Estado</span><strong className="mt-1 block capitalize">{reservation.estado}</strong></div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <button type="button" className="min-h-12 rounded-md bg-ink-900 px-3 text-sm font-semibold text-white" onClick={downloadQr}>Descargar QR</button>
          <button type="button" className="min-h-12 rounded-md bg-cream-bg2 px-3 text-sm font-semibold" onClick={() => void shareReservation()}>Compartir</button>
          <button type="button" className="flex min-h-12 items-center justify-center gap-2 rounded-md bg-cream-bg2 px-3 text-sm font-semibold" onClick={addCalendar}><CalendarIcon size={15} /> Calendario</button>
        </div>
        {shareMessage ? <p className="mt-3 text-center text-xs font-semibold text-ink-500" role="status">{shareMessage}</p> : null}
      </section>
      <Link to="/mesa/escanear" className="mt-5 flex min-h-12 items-center justify-center gap-2 rounded-md bg-coral px-4 text-sm font-semibold text-white"><CameraIcon size={16} /> Ya estoy en el restaurante</Link>
      <Link to="/inicio" className="mt-2 flex min-h-11 items-center justify-center text-sm font-semibold text-ink-400">Volver al inicio</Link>
    </main>
  );
}
