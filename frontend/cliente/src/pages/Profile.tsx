import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '@/auth/useAuth';
import { ArrowIcon, UsersIcon } from '@/components/icons';


export function ProfilePage(): JSX.Element {
  const { user, isGuest, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <main className="grid min-h-[100dvh] place-items-center bg-cream-bg px-5 text-center">
        <div><h1 className="font-serif text-3xl font-semibold">Tu espacio UTTOF</h1><p className="mt-2 text-sm text-ink-500">Inicia sesión para ver tu perfil.</p><Link to="/login" className="mt-5 inline-flex min-h-12 items-center rounded-md bg-coral px-5 text-sm font-semibold text-white">Iniciar sesión</Link></div>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-[100dvh] max-w-[440px] bg-cream-bg px-5 py-8 text-ink-900">
      <button type="button" className="min-h-11 text-sm font-semibold text-coral-600" onClick={() => navigate(-1)}>Volver</button>
      <div className="mt-4 grid h-20 w-20 place-items-center rounded-full bg-coral-50 text-coral-600"><UsersIcon size={32} /></div>
      <h1 className="mt-5 font-serif text-[34px] font-semibold">{isGuest ? 'Visita como invitado' : user.nombre}</h1>
      <p className="mt-2 text-sm text-ink-500">{isGuest ? 'Puedes pedir y pagar sin cuenta.' : user.email}</p>

      <div className="mt-8 space-y-3">
        {isGuest ? (
          <Link to="/registro" className="flex min-h-14 items-center justify-between rounded-md bg-coral px-4 text-sm font-semibold text-white">Crear cuenta sin perder pedidos <ArrowIcon size={16} /></Link>
        ) : (
          <Link to="/onboarding/preferencias" className="flex min-h-14 items-center justify-between rounded-md bg-cream-surface px-4 text-sm font-semibold shadow-soft">Editar preferencias <ArrowIcon size={16} /></Link>
        )}
        <Link to="/mesa/escanear" className="flex min-h-14 items-center justify-between rounded-md bg-cream-surface px-4 text-sm font-semibold shadow-soft">Escanear otra mesa <ArrowIcon size={16} /></Link>
      </div>
      <button type="button" className="mt-8 min-h-12 w-full rounded-md border border-coral-100 text-sm font-semibold text-coral-700" onClick={() => { logout(); navigate('/'); }}>Cerrar sesión</button>
    </main>
  );
}
