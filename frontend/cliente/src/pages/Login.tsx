import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';

import { getErrorDetail } from '@/api/errors';
import { useAuth } from '@/auth/useAuth';
import { ArrowIcon } from '@/components/icons';


export function LoginPage(): JSX.Element {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/inicio" replace />;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login({ email, password });
      navigate('/inicio');
    } catch (loginError) {
      setError(getErrorDetail(loginError, 'No se pudo iniciar sesión.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-[100dvh] place-items-center bg-cream-bg px-5 py-10">
      <div className="w-full max-w-[430px]">
        <Link to="/" className="block text-center font-serif text-3xl font-bold text-ink-900">UTTOF</Link>
        <h1 className="mt-7 text-center font-serif text-[34px] font-semibold">Qué gusto verte</h1>
        <p className="mt-2 text-center text-sm text-ink-500">Ingresa para reservar y conservar tu historial.</p>

        <form className="mt-7 space-y-4 rounded-xl bg-cream-surface p-5 shadow-soft" onSubmit={(event) => void handleSubmit(event)}>
          <label className="block text-sm font-semibold">Correo electrónico
            <input type="email" required autoComplete="email" value={email} className="mt-2 h-12 w-full rounded-md border-[rgba(31,26,20,0.14)] focus:border-coral focus:ring-coral-50" placeholder="tu@correo.pe" onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label className="block text-sm font-semibold">Contraseña
            <input type="password" required autoComplete="current-password" value={password} className="mt-2 h-12 w-full rounded-md border-[rgba(31,26,20,0.14)] focus:border-coral focus:ring-coral-50" placeholder="Mínimo 8 caracteres" onChange={(event) => setPassword(event.target.value)} />
          </label>
          {error ? <p className="rounded-md bg-coral-50 px-3 py-2 text-sm text-coral-700" role="alert">{error}</p> : null}
          <button type="submit" disabled={loading} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-coral px-4 text-sm font-semibold text-white disabled:opacity-60">
            {loading ? 'Ingresando...' : 'Iniciar sesión'} <ArrowIcon size={15} />
          </button>
          <div className="grid grid-cols-2 gap-2 border-t border-[rgba(31,26,20,0.08)] pt-4">
            <button type="button" disabled className="min-h-11 rounded-md bg-cream-bg2 text-xs font-semibold text-ink-400">Google · Próximamente</button>
            <button type="button" disabled className="min-h-11 rounded-md bg-cream-bg2 text-xs font-semibold text-ink-400">Apple · Próximamente</button>
          </div>
          <button type="button" disabled className="min-h-11 w-full text-xs font-semibold text-ink-400">Ingreso por SMS · Próximamente</button>
        </form>
        <p className="mt-5 text-center text-sm text-ink-500">¿Aún no tienes cuenta? <Link to="/registro" className="font-semibold text-coral-600">Crear cuenta</Link></p>
      </div>
    </main>
  );
}
