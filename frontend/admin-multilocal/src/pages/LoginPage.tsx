import { useState, type FormEvent } from 'react';
import { ArrowRight, Building2, LockKeyhole, Mail } from 'lucide-react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { getApiErrorMessage } from '../api/errors';
import { useAuth } from '../auth/useAuth';

interface LocationState {
  from?: string;
  unauthorized?: boolean;
}

export function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState | null;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(
    state?.unauthorized ? 'Tu cuenta no tiene acceso al panel multilocal.' : null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/admin/consolidado" replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login({ email: email.trim(), password });
      navigate(state?.from ?? '/admin/consolidado', { replace: true });
    } catch (loginError) {
      setError(getApiErrorMessage(loginError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-screen grid-cols-[minmax(420px,0.9fr)_minmax(620px,1.1fr)] bg-bg">
      <section className="flex items-center justify-center px-12 py-10">
        <div className="w-full max-w-[440px]">
          <div className="mb-10 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-card bg-coral text-white">
              <Building2 size={23} aria-hidden="true" />
            </span>
            <div>
              <p className="font-display text-3xl font-bold text-ink">UTTOF</p>
              <p className="text-xs font-semibold uppercase text-ink4">Administración multilocal</p>
            </div>
          </div>

          <h1 className="font-display text-[42px] font-bold leading-tight text-ink">
            Gestiona toda tu red
          </h1>
          <p className="mt-3 text-base leading-7 text-ink3">
            Accede al rendimiento consolidado y la operación de todas tus sucursales.
          </p>

          <form className="mt-9 space-y-5" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-ink2">Correo electrónico</span>
              <span className="flex h-12 items-center gap-3 rounded-card border border-[#DDD2C5] bg-surface px-4 focus-within:border-coral">
                <Mail size={18} className="text-ink4" aria-hidden="true" />
                <input
                  className="h-full min-w-0 flex-1 border-0 bg-transparent p-0 text-sm text-ink outline-none placeholder:text-ink4"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="admin@uttof.pe"
                />
              </span>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-ink2">Contraseña</span>
              <span className="flex h-12 items-center gap-3 rounded-card border border-[#DDD2C5] bg-surface px-4 focus-within:border-coral">
                <LockKeyhole size={18} className="text-ink4" aria-hidden="true" />
                <input
                  className="h-full min-w-0 flex-1 border-0 bg-transparent p-0 text-sm text-ink outline-none placeholder:text-ink4"
                  type="password"
                  autoComplete="current-password"
                  minLength={8}
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Ingresa tu contraseña"
                />
              </span>
            </label>

            {error ? (
              <div role="alert" className="rounded-card border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-card bg-coral px-5 text-sm font-bold text-white transition-colors hover:bg-coral-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Ingresando...' : 'Ingresar al panel'}
              {!isSubmitting ? <ArrowRight size={18} aria-hidden="true" /> : null}
            </button>
          </form>
        </div>
      </section>

      <section className="flex items-end bg-sidebar px-14 py-12 text-white">
        <div className="max-w-[620px]">
          <p className="font-mono text-xs font-semibold uppercase text-mint">Control unificado</p>
          <p className="mt-4 font-display text-[52px] font-semibold leading-tight">
            Una visión clara para cada local de UTTOF.
          </p>
          <div className="mt-9 h-1 w-20 bg-coral" />
        </div>
      </section>
    </div>
  );
}
