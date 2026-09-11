import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { checkinMesaQr } from '@/api/cliente';
import { getErrorDetail } from '@/api/errors';
import { useAuth } from '@/auth/useAuth';
import { CameraIcon } from '@/components/icons';
import type { MesaSession } from '@/types';


export function DirectMesaPage({ onCheckedIn }: { onCheckedIn: (mesa: MesaSession) => void }): JSX.Element {
  const { token = '' } = useParams();
  const { acceptSession } = useAuth();
  const navigate = useNavigate();
  const started = useRef(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (started.current || !token) return;
    started.current = true;
    checkinMesaQr(token)
      .then((response) => {
        acceptSession(response.sesion);
        onCheckedIn(response.mesa);
        navigate('/mesa/confirmar', { replace: true });
      })
      .catch((checkinError: unknown) => setError(getErrorDetail(checkinError, 'No se pudo abrir esta mesa.')));
  }, [acceptSession, navigate, onCheckedIn, token]);

  return (
    <main className="grid min-h-[100dvh] place-items-center bg-ink-900 px-6 text-center text-white">
      <div className="max-w-sm">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-white/10 text-coral"><CameraIcon size={28} /></div>
        <h1 className="mt-5 font-serif text-3xl font-semibold">{error ? 'No pudimos abrir la mesa' : 'Validando tu mesa'}</h1>
        <p className="mt-3 text-sm leading-6 text-white/60">{error ?? 'Estamos creando una sesión segura para tu visita.'}</p>
        {error ? <Link to="/mesa/escanear" className="mt-5 inline-flex min-h-12 items-center rounded-md bg-coral px-5 text-sm font-semibold text-white">Escanear nuevamente</Link> : <div className="mx-auto mt-6 h-2 w-28 overflow-hidden rounded-full bg-white/10"><div className="h-full w-1/2 animate-pulse rounded-full bg-coral" /></div>}
      </div>
    </main>
  );
}
