import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { useEffect, useMemo, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/Button';
import type { UserRole, Usuario, UsuarioCreate, UsuarioPatch } from '@/types/api';

const usuarioFormSchema = z.object({
  nombre: z.string().trim().min(2, 'El nombre debe tener mínimo 2 caracteres.').max(120, 'Máximo 120 caracteres.'),
  email: z.string().trim().email('Ingresa un email válido.'),
  telefono: z.string().trim().max(20, 'Máximo 20 caracteres.'),
  password: z
    .string()
    .refine((value) => value === '' || value.length >= 8, 'La contraseña debe tener mínimo 8 caracteres.')
    .refine((value) => value.length <= 72, 'Máximo 72 caracteres.'),
  rol: z.enum(['cliente', 'mesero', 'cocina', 'admin']),
});

type UsuarioFormValues = z.infer<typeof usuarioFormSchema>;

export type UsuarioFormSubmit =
  | { mode: 'create'; payload: UsuarioCreate }
  | { mode: 'edit'; idUsuario: number; payload: UsuarioPatch };

interface UsuarioFormModalProps {
  mode: 'create' | 'edit';
  usuario?: Usuario;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (data: UsuarioFormSubmit) => Promise<void>;
}

const roles: Array<{ value: UserRole; label: string }> = [
  { value: 'admin', label: 'Administrador' },
  { value: 'mesero', label: 'Mesero' },
  { value: 'cocina', label: 'Cocina' },
  { value: 'cliente', label: 'Cliente' },
];

function getDefaultValues(usuario?: Usuario): UsuarioFormValues {
  return {
    nombre: usuario?.nombre ?? '',
    email: usuario?.email ?? '',
    telefono: usuario?.telefono ?? '',
    password: '',
    rol: usuario?.rol ?? 'mesero',
  };
}

export function UsuarioFormModal({
  mode,
  usuario,
  isSubmitting,
  onClose,
  onSubmit,
}: UsuarioFormModalProps): JSX.Element {
  const modalRef = useRef<HTMLElement | null>(null);
  const titleId = useMemo(() => `usuario-modal-title-${mode}`, [mode]);
  const descriptionId = useMemo(() => `usuario-modal-description-${mode}`, [mode]);

  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm<UsuarioFormValues>({
    defaultValues: getDefaultValues(usuario),
    mode: 'onBlur',
    resolver: zodResolver(usuarioFormSchema),
  });

  useEffect(() => {
    reset(getDefaultValues(usuario));
  }, [reset, usuario]);

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
          'button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
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

  async function submitForm(values: UsuarioFormValues): Promise<void> {
    const telefono = values.telefono === '' ? null : values.telefono;

    if (mode === 'create') {
      if (values.password === '') {
        setError('password', { message: 'Ingresa una contraseña temporal.' });
        return;
      }

      await onSubmit({
        mode,
        payload: {
          nombre: values.nombre,
          email: values.email,
          telefono,
          password: values.password,
          rol: values.rol,
        },
      });
      return;
    }

    if (!usuario) return;
    await onSubmit({
      mode,
      idUsuario: usuario.id_usuario,
      payload: {
        nombre: values.nombre,
        telefono,
        rol: values.rol,
      },
    });
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink-900/35 px-4 py-6" role="presentation">
      <section
        ref={modalRef}
        aria-describedby={descriptionId}
        aria-labelledby={titleId}
        aria-modal="true"
        className="max-h-[calc(100vh-48px)] w-full max-w-[560px] overflow-y-auto rounded-lg border border-[rgba(42,30,20,0.08)] bg-white p-5 text-ink-900 shadow-lg-soft animate-[count-in_220ms_cubic-bezier(.18,.9,.32,1.18)]"
        role="dialog"
        tabIndex={-1}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id={titleId} className="font-serif text-h1">
              {mode === 'create' ? 'Nuevo usuario' : 'Editar usuario'}
            </h2>
            <p id={descriptionId} className="mt-1 text-sm text-ink-500">
              {mode === 'create' ? 'Crea un acceso para el equipo o un cliente.' : 'Actualiza los datos y permisos del usuario.'}
            </p>
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

        <form className="mt-6 space-y-4" onSubmit={handleSubmit(submitForm)} noValidate>
          <div>
            <label className="mb-1.5 block text-label uppercase text-ink-500" htmlFor="usuario-nombre">
              Nombre
            </label>
            <input
              id="usuario-nombre"
              type="text"
              autoComplete="name"
              className="h-10 w-full rounded-md border border-[rgba(42,30,20,0.14)] px-3.5 text-sm text-ink-900 placeholder:text-ink-400 transition focus:border-terracotta-500 focus:ring-4 focus:ring-terracotta-100"
              placeholder="Nombre completo"
              aria-invalid={errors.nombre ? 'true' : 'false'}
              aria-describedby={errors.nombre ? 'usuario-nombre-error' : undefined}
              {...register('nombre')}
            />
            {errors.nombre ? <p id="usuario-nombre-error" className="mt-1.5 text-xs font-medium text-danger">{errors.nombre.message}</p> : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-label uppercase text-ink-500" htmlFor="usuario-email">
                Email
              </label>
              <input
                id="usuario-email"
                type="email"
                autoComplete="email"
                className="h-10 w-full rounded-md border border-[rgba(42,30,20,0.14)] px-3.5 text-sm text-ink-900 placeholder:text-ink-400 transition disabled:bg-cream-50 disabled:text-ink-500 focus:border-terracotta-500 focus:ring-4 focus:ring-terracotta-100"
                placeholder="persona@uttof.pe"
                aria-invalid={errors.email ? 'true' : 'false'}
                aria-describedby={errors.email ? 'usuario-email-error' : undefined}
                disabled={mode === 'edit'}
                {...register('email')}
              />
              {errors.email ? <p id="usuario-email-error" className="mt-1.5 text-xs font-medium text-danger">{errors.email.message}</p> : null}
            </div>

            <div>
              <label className="mb-1.5 block text-label uppercase text-ink-500" htmlFor="usuario-telefono">
                Teléfono
              </label>
              <input
                id="usuario-telefono"
                type="tel"
                autoComplete="tel"
                className="h-10 w-full rounded-md border border-[rgba(42,30,20,0.14)] px-3.5 text-sm text-ink-900 placeholder:text-ink-400 transition focus:border-terracotta-500 focus:ring-4 focus:ring-terracotta-100"
                placeholder="+51 999 999 999"
                aria-invalid={errors.telefono ? 'true' : 'false'}
                aria-describedby={errors.telefono ? 'usuario-telefono-error' : undefined}
                {...register('telefono')}
              />
              {errors.telefono ? <p id="usuario-telefono-error" className="mt-1.5 text-xs font-medium text-danger">{errors.telefono.message}</p> : null}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-label uppercase text-ink-500" htmlFor="usuario-rol">
                Rol
              </label>
              <select
                id="usuario-rol"
                className="h-10 w-full rounded-md border border-[rgba(42,30,20,0.14)] px-3.5 text-sm text-ink-900 transition focus:border-terracotta-500 focus:ring-4 focus:ring-terracotta-100"
                {...register('rol')}
              >
                {roles.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}
              </select>
            </div>

            {mode === 'create' ? (
              <div>
                <label className="mb-1.5 block text-label uppercase text-ink-500" htmlFor="usuario-password">
                  Contraseña temporal
                </label>
                <input
                  id="usuario-password"
                  type="password"
                  autoComplete="new-password"
                  className="h-10 w-full rounded-md border border-[rgba(42,30,20,0.14)] px-3.5 text-sm text-ink-900 placeholder:text-ink-400 transition focus:border-terracotta-500 focus:ring-4 focus:ring-terracotta-100"
                  placeholder="Mínimo 8 caracteres"
                  aria-invalid={errors.password ? 'true' : 'false'}
                  aria-describedby={errors.password ? 'usuario-password-error' : undefined}
                  {...register('password')}
                />
                {errors.password ? <p id="usuario-password-error" className="mt-1.5 text-xs font-medium text-danger">{errors.password.message}</p> : null}
              </div>
            ) : null}
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-dashed border-[rgba(42,30,20,0.08)] pt-5 sm:flex-row sm:justify-end">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" loading={isSubmitting}>
              {isSubmitting ? 'Guardando...' : mode === 'create' ? 'Crear usuario' : 'Guardar cambios'}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
