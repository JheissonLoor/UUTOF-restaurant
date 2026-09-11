import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { getErrorDetail } from '@/api/errors';
import { useAuth } from '@/auth/useAuth';
import { ArrowIcon, CheckIcon } from '@/components/icons';


export function RegisterPage(): JSX.Element {
  const { isGuest, register, upgradeGuest } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ nombres: '', apellidos: '', email: '', telefono: '', password: '' });
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update(field: keyof typeof form, value: string): void {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!accepted) {
      setError('Debes aceptar los términos y la política de privacidad.');
      return;
    }
    setLoading(true);
    setError(null);
    const payload = {
      nombre: `${form.nombres.trim()} ${form.apellidos.trim()}`.trim(),
      email: form.email.trim(),
      telefono: form.telefono.trim() ? `+51${form.telefono.replace(/\D/g, '')}` : undefined,
      password: form.password,
    };
    try {
      if (isGuest) await upgradeGuest(payload);
      else await register(payload);
      navigate('/onboarding/preferencias');
    } catch (registerError) {
      setError(getErrorDetail(registerError, 'No se pudo crear la cuenta.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-[100dvh] place-items-center bg-cream-bg px-5 py-10">
      <div className="w-full max-w-[460px]">
        <Link to="/" className="block text-center font-serif text-3xl font-bold">UTTOF</Link>
        <h1 className="mt-6 text-center font-serif text-[34px] font-semibold">{isGuest ? 'Guarda tu experiencia' : 'Crea tu cuenta'}</h1>
        <p className="mt-2 text-center text-sm text-ink-500">{isGuest ? 'Tus pedidos actuales permanecerán contigo.' : 'Reserva, guarda preferencias y revisa tus visitas.'}</p>

        <form className="mt-7 space-y-4 rounded-xl bg-cream-surface p-5 shadow-soft" onSubmit={(event) => void handleSubmit(event)}>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-semibold">Nombres
              <input required autoComplete="given-name" value={form.nombres} className="mt-2 h-12 w-full rounded-md border-[rgba(31,26,20,0.14)] focus:border-coral focus:ring-coral-50" onChange={(event) => update('nombres', event.target.value)} />
            </label>
            <label className="text-sm font-semibold">Apellidos
              <input required autoComplete="family-name" value={form.apellidos} className="mt-2 h-12 w-full rounded-md border-[rgba(31,26,20,0.14)] focus:border-coral focus:ring-coral-50" onChange={(event) => update('apellidos', event.target.value)} />
            </label>
          </div>
          <label className="block text-sm font-semibold">Correo electrónico
            <input type="email" required autoComplete="email" value={form.email} className="mt-2 h-12 w-full rounded-md border-[rgba(31,26,20,0.14)] focus:border-coral focus:ring-coral-50" placeholder="tu@correo.pe" onChange={(event) => update('email', event.target.value)} />
          </label>
          <label className="block text-sm font-semibold">Celular peruano
            <div className="mt-2 flex">
              <span className="grid h-12 place-items-center rounded-l-md border border-r-0 border-[rgba(31,26,20,0.14)] bg-cream-bg2 px-3 text-sm font-semibold">+51</span>
              <input type="tel" required inputMode="numeric" autoComplete="tel" maxLength={9} value={form.telefono} className="h-12 min-w-0 flex-1 rounded-l-none rounded-r-md border-[rgba(31,26,20,0.14)] focus:border-coral focus:ring-coral-50" placeholder="999 999 999" onChange={(event) => update('telefono', event.target.value.replace(/\D/g, '').slice(0, 9))} />
            </div>
          </label>
          <label className="block text-sm font-semibold">Contraseña
            <input type="password" required minLength={8} maxLength={72} autoComplete="new-password" aria-describedby="password-help" value={form.password} className="mt-2 h-12 w-full rounded-md border-[rgba(31,26,20,0.14)] focus:border-coral focus:ring-coral-50" placeholder="Mínimo 8 caracteres" onChange={(event) => update('password', event.target.value)} />
            <span id="password-help" className="mt-1.5 block text-xs font-normal text-ink-400">Usa al menos 8 caracteres.</span>
          </label>
          <label className="flex min-h-11 cursor-pointer items-start gap-3 text-xs leading-5 text-ink-500">
            <input type="checkbox" checked={accepted} className="mt-1 rounded border-ink-400 text-coral focus:ring-coral-50" onChange={(event) => setAccepted(event.target.checked)} />
            Acepto los términos de uso y la política de privacidad de UTTOF.
          </label>
          {error ? <p className="rounded-md bg-coral-50 px-3 py-2 text-sm text-coral-700" role="alert">{error}</p> : null}
          <button type="submit" disabled={loading} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-coral px-4 text-sm font-semibold text-white disabled:opacity-60">
            {loading ? 'Guardando...' : isGuest ? 'Convertir en cuenta' : 'Crear cuenta'} {isGuest ? <CheckIcon size={15} /> : <ArrowIcon size={15} />}
          </button>
        </form>
        {!isGuest ? (
          <Link to="/login" className="relative z-10 mt-4 flex min-h-12 w-full items-center justify-center gap-1 rounded-md text-center text-sm text-ink-500 transition-colors hover:bg-cream-bg2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-500 focus-visible:ring-offset-2">
            <span>¿Ya tienes cuenta?</span>
            <span className="font-semibold text-coral-600">Iniciar sesión</span>
          </Link>
        ) : null}
      </div>
    </main>
  );
}
