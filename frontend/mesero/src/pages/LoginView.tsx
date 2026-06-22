import { LockKeyhole, Mail, UtensilsCrossed } from 'lucide-react';
import { useState, type FormEvent } from 'react';

import { getErrorDetail } from '@/api/errors';
import { useAuth } from '@/auth/useAuth';

export function LoginView(): JSX.Element {
  const { login } = useAuth();
  const [email, setEmail] = useState('mesero@uttof.pe');
  const [password, setPassword] = useState('mesero123');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login({ email: email.trim(), password });
    } catch (loginError) {
      setError(getErrorDetail(loginError, 'No se pudo iniciar sesion.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex h-[100dvh] items-center justify-center overflow-y-auto bg-cream-50 px-5 py-8 text-ink-900">
      <section className="w-full max-w-[420px] rounded-lg border border-[rgba(31,26,20,0.08)] bg-white p-6 shadow-md-soft">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-md bg-terracotta-500 text-white shadow-md-soft">
          <UtensilsCrossed aria-hidden="true" size={22} strokeWidth={1.8} />
        </div>
        <div className="mt-4 text-center">
          <h1 className="font-serif text-[26px] font-semibold">UTTOF Mesero</h1>
          <p className="mt-1 text-sm text-ink-500">Ingresa para ver las mesas de tu turno.</p>
        </div>

        <form className="mt-6 space-y-4" onSubmit={(event) => void handleSubmit(event)}>
          <div>
            <label className="mb-1.5 block text-label uppercase text-ink-500" htmlFor="mesero-email">Email</label>
            <div className="relative">
              <Mail aria-hidden="true" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" size={17} />
              <input id="mesero-email" type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="h-12 w-full rounded-md border border-[rgba(31,26,20,0.16)] pl-11 pr-3.5 text-sm focus:border-terracotta-500 focus:ring-4 focus:ring-terracotta-100" />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-label uppercase text-ink-500" htmlFor="mesero-password">Contrasena</label>
            <div className="relative">
              <LockKeyhole aria-hidden="true" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" size={17} />
              <input id="mesero-password" type="password" required autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="h-12 w-full rounded-md border border-[rgba(31,26,20,0.16)] pl-11 pr-3.5 text-sm focus:border-terracotta-500 focus:ring-4 focus:ring-terracotta-100" />
            </div>
          </div>
          {error ? <div className="rounded-md bg-wine-100 px-4 py-3 text-sm text-wine-500" role="alert">{error}</div> : null}
          <button type="submit" disabled={isSubmitting} className="flex h-12 w-full items-center justify-center rounded-md bg-terracotta-500 px-4 text-sm font-semibold text-white shadow-md-soft transition active:scale-[0.98] disabled:opacity-60">
            {isSubmitting ? 'Ingresando...' : 'Ingresar al turno'}
          </button>
        </form>
      </section>
    </main>
  );
}
