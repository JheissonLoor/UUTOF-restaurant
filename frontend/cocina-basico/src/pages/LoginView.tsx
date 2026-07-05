import { useState, type FormEvent } from 'react';

import { getErrorDetail } from '@/api/errors';
import { useAuth } from '@/auth/useAuth';
import { ChefIcon, LockIcon, MailIcon, UtensilsMark } from '@/components/icons';

export function LoginView(): JSX.Element {
  const { login } = useAuth();
  const [email, setEmail] = useState('cocina@uttof.pe');
  const [password, setPassword] = useState('cocina123');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login({ email: email.trim(), password });
    } catch (loginError) {
      setError(getErrorDetail(loginError, 'No se pudo iniciar sesión.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex h-[100dvh] items-center justify-center overflow-y-auto bg-cream-bg px-5 py-8 text-ink-900">
      <section className="w-full max-w-[430px] rounded-lg border border-[rgba(31,26,20,0.08)] bg-cream-surface p-6 shadow-soft">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-md bg-coral text-white shadow-soft">
          <UtensilsMark />
        </div>
        <div className="mt-4 text-center">
          <h1 className="font-serif text-[28px] font-semibold">UTTOF Cocina</h1>
          <p className="mt-1 flex items-center justify-center gap-2 text-sm text-ink-500">
            <ChefIcon size={15} />
            Panel básico para el turno de cocina
          </p>
        </div>

        <form className="mt-6 space-y-4" onSubmit={(event) => void handleSubmit(event)}>
          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.08em] text-ink-500" htmlFor="cocina-email">
              Email
            </label>
            <div className="relative">
              <MailIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" size={17} />
              <input
                id="cocina-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-12 w-full rounded-md border border-[rgba(31,26,20,0.16)] bg-white pl-11 pr-3.5 text-sm outline-none transition focus:border-coral focus:ring-4 focus:ring-coral-50"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.08em] text-ink-500" htmlFor="cocina-password">
              Contraseña
            </label>
            <div className="relative">
              <LockIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" size={17} />
              <input
                id="cocina-password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-12 w-full rounded-md border border-[rgba(31,26,20,0.16)] bg-white pl-11 pr-3.5 text-sm outline-none transition focus:border-coral focus:ring-4 focus:ring-coral-50"
              />
            </div>
          </div>

          {error ? (
            <div className="rounded-md bg-coral-50 px-4 py-3 text-sm font-medium text-coral-600" role="alert">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex h-12 w-full items-center justify-center rounded-md bg-coral px-4 text-sm font-semibold text-white shadow-[0_8px_20px_-8px_rgba(233,75,51,0.5)] transition active:scale-[0.98] disabled:opacity-60"
          >
            {isSubmitting ? 'Ingresando...' : 'Ingresar al panel'}
          </button>
        </form>
      </section>
    </main>
  );
}
