import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { getErrorDetail } from '@/api/errors';
import { useAuth } from '@/auth/useAuth';

const loginSchema = z.object({
  email: z.string().min(1, 'Ingresa tu email.').email('Ingresa un email válido.'),
  password: z.string().min(8, 'La contraseña debe tener mínimo 8 caracteres.'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface RouteState {
  from?: {
    pathname?: string;
  };
}

function getRedirectPath(state: unknown): string {
  if (
    typeof state === 'object' &&
    state !== null &&
    'from' in state &&
    typeof (state as RouteState).from?.pathname === 'string'
  ) {
    return (state as RouteState).from?.pathname ?? '/dashboard';
  }

  return '/dashboard';
}

export function LoginPage(): JSX.Element {
  const { isAuthenticated, isLoading, login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const redirectPath = useMemo(() => getRedirectPath(location.state), [location.state]);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    formState: { errors, isSubmitting, touchedFields },
    handleSubmit,
    register,
    resetField,
  } = useForm<LoginFormValues>({
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onBlur',
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    setFormError(null);
  }, [location.key]);

  if (!isLoading && isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  async function onSubmit(values: LoginFormValues): Promise<void> {
    setFormError(null);

    try {
      await login(values.email, values.password);
      navigate(redirectPath, { replace: true });
    } catch (error) {
      resetField('password');
      setFormError(getErrorDetail(error, 'No pudimos iniciar sesión. Revisa tus credenciales.'));
    }
  }

  return (
    <main id="main-content" className="grid min-h-screen place-items-center bg-cream-50 px-6 py-10 text-ink-900">
      <section className="w-full max-w-[400px] rounded-lg border border-[rgba(42,30,20,0.08)] bg-white p-6 shadow-sm-soft">
        <div className="mb-7 flex flex-col items-center text-center">
          <div className="grid h-10 w-10 place-items-center rounded-[10px] bg-gradient-to-br from-terracotta-400 to-terracotta-600 font-serif text-lg font-bold text-white shadow-[0_1px_0_rgba(255,255,255,0.2)_inset,0_2px_6px_rgba(233,75,51,0.35)]">
            U
          </div>
          <h1 className="mt-4 font-serif text-h1">UTTOF — Administración</h1>
          <p className="mt-2 text-sm text-ink-500">Acceso privado del panel administrativo.</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div>
            <label className="mb-1.5 block text-label uppercase text-ink-500" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="h-10 w-full rounded-md border border-[rgba(42,30,20,0.14)] px-3.5 text-sm text-ink-900 placeholder:text-ink-400 transition focus:border-terracotta-500 focus:ring-4 focus:ring-terracotta-100"
              placeholder="admin@uttof.pe"
              aria-invalid={errors.email ? 'true' : 'false'}
              aria-describedby={errors.email ? 'email-error' : undefined}
              {...register('email')}
            />
            {errors.email && touchedFields.email ? (
              <p id="email-error" className="mt-1.5 text-xs font-medium text-danger">
                {errors.email.message}
              </p>
            ) : null}
          </div>

          <div>
            <label className="mb-1.5 block text-label uppercase text-ink-500" htmlFor="password">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className="h-10 w-full rounded-md border border-[rgba(42,30,20,0.14)] px-3.5 text-sm text-ink-900 placeholder:text-ink-400 transition focus:border-terracotta-500 focus:ring-4 focus:ring-terracotta-100"
              placeholder="••••••••"
              aria-invalid={errors.password ? 'true' : 'false'}
              aria-describedby={errors.password ? 'password-error' : undefined}
              {...register('password')}
            />
            {errors.password && touchedFields.password ? (
              <p id="password-error" className="mt-1.5 text-xs font-medium text-danger">
                {errors.password.message}
              </p>
            ) : null}
          </div>

          {formError ? (
            <div className="rounded-md border border-wine-100 bg-wine-100 px-3.5 py-3 text-sm font-medium text-wine-500">
              {formError}
            </div>
          ) : null}

          <button
            type="submit"
            className="mt-2 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-terracotta-500 px-5 text-sm font-semibold text-white shadow-md-soft transition hover:-translate-y-px hover:bg-terracotta-600 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
            disabled={isSubmitting}
          >
            {isSubmitting ? <Loader2 aria-hidden="true" className="animate-spin" size={17} strokeWidth={1.8} /> : null}
            {isSubmitting ? 'Iniciando...' : 'Iniciar sesión'}
          </button>
        </form>
      </section>
    </main>
  );
}
