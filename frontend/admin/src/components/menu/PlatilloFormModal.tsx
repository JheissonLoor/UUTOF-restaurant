import { zodResolver } from '@hookform/resolvers/zod';
import clsx from 'clsx';
import { X } from 'lucide-react';
import { useEffect, useMemo, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/Button';
import type { Categoria, Platillo, PlatilloWrite } from '@/types/api';

const optionalUrlSchema = z
  .string()
  .trim()
  .refine((value) => value === '' || /^https?:\/\/\S+$/i.test(value), 'Ingresa una URL válida.');

const platilloFormSchema = z.object({
  nombre: z.string().trim().min(2, 'El nombre debe tener mínimo 2 caracteres.').max(120, 'Máximo 120 caracteres.'),
  id_categoria: z
    .string()
    .min(1, 'Selecciona una categoría.')
    .refine((value) => Number.isInteger(Number(value)) && Number(value) > 0, 'Selecciona una categoría válida.'),
  precio: z
    .string()
    .min(1, 'Ingresa el precio.')
    .refine((value) => Number.isFinite(Number(value)) && Number(value) >= 0, 'El precio debe ser mayor o igual a 0.'),
  imagen_url: optionalUrlSchema,
  disponible: z.boolean(),
});

type PlatilloFormValues = z.infer<typeof platilloFormSchema>;

interface PlatilloFormModalProps {
  mode: 'create' | 'edit';
  categorias: Categoria[];
  platillo?: Platillo;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: PlatilloWrite) => Promise<void>;
}

function getDefaultValues(platillo?: Platillo): PlatilloFormValues {
  return {
    nombre: platillo?.nombre ?? '',
    id_categoria: platillo?.id_categoria ? String(platillo.id_categoria) : '',
    precio: platillo ? String(platillo.precio) : '',
    imagen_url: platillo?.imagen_url ?? '',
    disponible: platillo?.disponible ?? true,
  };
}

function buildPayload(values: PlatilloFormValues): PlatilloWrite {
  const imageUrl = values.imagen_url.trim();

  return {
    id_categoria: Number(values.id_categoria),
    nombre: values.nombre.trim(),
    precio: Number(values.precio),
    disponible: values.disponible,
    imagen_url: imageUrl === '' ? null : imageUrl,
  };
}

export function PlatilloFormModal({
  mode,
  categorias,
  platillo,
  isSubmitting,
  onClose,
  onSubmit,
}: PlatilloFormModalProps): JSX.Element {
  const modalRef = useRef<HTMLElement | null>(null);
  const titleId = useMemo(() => `platillo-modal-title-${mode}`, [mode]);
  const descriptionId = useMemo(() => `platillo-modal-description-${mode}`, [mode]);

  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
    watch,
  } = useForm<PlatilloFormValues>({
    defaultValues: getDefaultValues(platillo),
    mode: 'onBlur',
    resolver: zodResolver(platilloFormSchema),
  });

  const disponible = watch('disponible');

  useEffect(() => {
    reset(getDefaultValues(platillo));
  }, [platillo, reset]);

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
          'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
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

  async function submitForm(values: PlatilloFormValues): Promise<void> {
    await onSubmit(buildPayload(values));
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
              {mode === 'create' ? 'Nuevo platillo' : 'Editar platillo'}
            </h2>
            <p id={descriptionId} className="mt-1 text-sm text-ink-500">
              {mode === 'create' ? 'Agrega un platillo al catálogo operativo.' : 'Actualiza los datos del platillo.'}
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
            <label className="mb-1.5 block text-label uppercase text-ink-500" htmlFor="platillo-nombre">
              Nombre
            </label>
            <input
              id="platillo-nombre"
              type="text"
              autoComplete="off"
              className="h-10 w-full rounded-md border border-[rgba(42,30,20,0.14)] px-3.5 text-sm text-ink-900 placeholder:text-ink-400 transition focus:border-terracotta-500 focus:ring-4 focus:ring-terracotta-100"
              placeholder="Lomo saltado UTTOF"
              aria-invalid={errors.nombre ? 'true' : 'false'}
              aria-describedby={errors.nombre ? 'platillo-nombre-error' : undefined}
              {...register('nombre')}
            />
            {errors.nombre ? (
              <p id="platillo-nombre-error" className="mt-1.5 text-xs font-medium text-danger">
                {errors.nombre.message}
              </p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-label uppercase text-ink-500" htmlFor="platillo-categoria">
                Categoría
              </label>
              <select
                id="platillo-categoria"
                className="h-10 w-full rounded-md border border-[rgba(42,30,20,0.14)] px-3.5 text-sm text-ink-900 transition focus:border-terracotta-500 focus:ring-4 focus:ring-terracotta-100"
                aria-invalid={errors.id_categoria ? 'true' : 'false'}
                aria-describedby={errors.id_categoria ? 'platillo-categoria-error' : undefined}
                disabled={categorias.length === 0}
                {...register('id_categoria')}
              >
                <option value="">Selecciona</option>
                {categorias.map((categoria) => (
                  <option key={categoria.id_categoria} value={categoria.id_categoria}>
                    {categoria.nombre}
                  </option>
                ))}
              </select>
              {errors.id_categoria ? (
                <p id="platillo-categoria-error" className="mt-1.5 text-xs font-medium text-danger">
                  {errors.id_categoria.message}
                </p>
              ) : null}
            </div>

            <div>
              <label className="mb-1.5 block text-label uppercase text-ink-500" htmlFor="platillo-precio">
                Precio
              </label>
              <input
                id="platillo-precio"
                type="number"
                min="0"
                step="0.01"
                className="h-10 w-full rounded-md border border-[rgba(42,30,20,0.14)] px-3.5 text-sm text-ink-900 placeholder:text-ink-400 transition focus:border-terracotta-500 focus:ring-4 focus:ring-terracotta-100"
                placeholder="42.00"
                aria-invalid={errors.precio ? 'true' : 'false'}
                aria-describedby={errors.precio ? 'platillo-precio-error' : undefined}
                {...register('precio')}
              />
              {errors.precio ? (
                <p id="platillo-precio-error" className="mt-1.5 text-xs font-medium text-danger">
                  {errors.precio.message}
                </p>
              ) : null}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-label uppercase text-ink-500" htmlFor="platillo-imagen">
              Imagen URL
            </label>
            <input
              id="platillo-imagen"
              type="url"
              autoComplete="off"
              className="h-10 w-full rounded-md border border-[rgba(42,30,20,0.14)] px-3.5 text-sm text-ink-900 placeholder:text-ink-400 transition focus:border-terracotta-500 focus:ring-4 focus:ring-terracotta-100"
              placeholder="https://..."
              aria-invalid={errors.imagen_url ? 'true' : 'false'}
              aria-describedby={errors.imagen_url ? 'platillo-imagen-error' : undefined}
              {...register('imagen_url')}
            />
            {errors.imagen_url ? (
              <p id="platillo-imagen-error" className="mt-1.5 text-xs font-medium text-danger">
                {errors.imagen_url.message}
              </p>
            ) : null}
          </div>

          <label className="flex items-center justify-between gap-4 rounded-md border border-[rgba(42,30,20,0.08)] bg-cream-50 px-4 py-3">
            <span>
              <span className="block text-sm font-semibold text-ink-900">Disponible para venta</span>
              <span className="block text-xs text-ink-500">Controla si aparece como activo en el panel.</span>
            </span>
            <input type="checkbox" className="sr-only" {...register('disponible')} />
            <span
              className={clsx(
                'inline-flex h-8 w-[64px] shrink-0 items-center rounded-full p-1 transition duration-150',
                disponible ? 'bg-sage-100' : 'bg-cream-200',
              )}
              aria-hidden="true"
            >
              <span
                className={clsx(
                  'h-6 w-6 rounded-full bg-white shadow-sm-soft transition-transform duration-150',
                  disponible ? 'translate-x-8' : 'translate-x-0',
                )}
              />
            </span>
          </label>

          <div className="flex flex-col-reverse gap-3 border-t border-dashed border-[rgba(42,30,20,0.08)] pt-5 sm:flex-row sm:justify-end">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" loading={isSubmitting} disabled={categorias.length === 0}>
              {isSubmitting ? (
                'Guardando...'
              ) : (
                <>
                  {mode === 'create' ? 'Crear platillo' : 'Guardar cambios'}
                </>
              )}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
