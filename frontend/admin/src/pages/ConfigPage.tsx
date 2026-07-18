import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import {
  Bell,
  Building2,
  CreditCard,
  LockKeyhole,
  Save,
  Settings,
  ShieldCheck,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useEffect, useState, type HTMLInputTypeAttribute } from 'react';
import {
  useForm,
  type FieldErrors,
  type Path,
  type UseFormRegister,
} from 'react-hook-form';
import { z } from 'zod';

import { getConfiguracion, updateConfiguracion } from '@/api/configuracion';
import { getErrorDetail } from '@/api/errors';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import type { Configuracion } from '@/types/api';

type ConfigTab = 'restaurante' | 'pagos' | 'notificaciones' | 'seguridad';

const timeRegex = /^\d{2}:\d{2}$/;

const configSchema = z.object({
  restaurante: z.object({
    nombre_comercial: z.string().min(2, 'Ingresa el nombre comercial'),
    ruc: z.string().regex(/^\d{11}$/, 'El RUC debe tener 11 digitos'),
    direccion: z.string().min(3, 'Ingresa una direccion'),
    telefono: z.string().min(7, 'Ingresa un telefono valido'),
    email: z.string().email('Email invalido'),
    timezone: z.literal('America/Lima'),
    moneda: z.literal('PEN'),
    igv_pct: z.number().min(0).max(100),
    horario_apertura: z.string().regex(timeRegex, 'Usa formato HH:MM'),
    horario_cierre: z.string().regex(timeRegex, 'Usa formato HH:MM'),
  }),
  pagos: z.object({
    acepta_efectivo: z.boolean(),
    acepta_tarjeta: z.boolean(),
    acepta_yape: z.boolean(),
    yape_numero: z.string().max(32),
    pos_proveedor: z.string().max(80),
    propina_sugerida_pct: z.number().min(0).max(30),
    comprobante_default: z.enum(['boleta', 'factura']),
  }),
  notificaciones: z.object({
    email_admin: z.string().email('Email invalido'),
    email_reservas: z.boolean(),
    alertas_stock_bajo: z.boolean(),
    sonido_cocina: z.boolean(),
    resumen_diario_email: z.boolean(),
  }),
  seguridad: z.object({
    sesion_minutos: z.number().min(15).max(720),
    mfa_admin: z.boolean(),
    intentos_login: z.number().min(3).max(10),
    bloqueo_minutos: z.number().min(5).max(120),
    rotacion_claves_dias: z.number().min(30).max(365),
  }),
});

type ConfiguracionFormValues = z.infer<typeof configSchema>;
type RegisterOptionsForConfig = Parameters<UseFormRegister<ConfiguracionFormValues>>[1];

const defaultConfig: ConfiguracionFormValues = {
  restaurante: {
    nombre_comercial: 'UTTOF Restaurante',
    ruc: '20601234567',
    direccion: 'Av. Larco 123, Miraflores, Lima',
    telefono: '+51 999 999 999',
    email: 'admin@uttof.pe',
    timezone: 'America/Lima',
    moneda: 'PEN',
    igv_pct: 18,
    horario_apertura: '12:00',
    horario_cierre: '23:00',
  },
  pagos: {
    acepta_efectivo: true,
    acepta_tarjeta: true,
    acepta_yape: true,
    yape_numero: '+51 999 999 999',
    pos_proveedor: 'Niubiz',
    propina_sugerida_pct: 10,
    comprobante_default: 'boleta',
  },
  notificaciones: {
    email_admin: 'admin@uttof.pe',
    email_reservas: true,
    alertas_stock_bajo: true,
    sonido_cocina: true,
    resumen_diario_email: false,
  },
  seguridad: {
    sesion_minutos: 15,
    mfa_admin: false,
    intentos_login: 5,
    bloqueo_minutos: 15,
    rotacion_claves_dias: 90,
  },
};

const tabs: Array<{ id: ConfigTab; label: string; icon: LucideIcon }> = [
  { id: 'restaurante', label: 'Restaurante', icon: Building2 },
  { id: 'pagos', label: 'Pagos', icon: CreditCard },
  { id: 'notificaciones', label: 'Notificaciones', icon: Bell },
  { id: 'seguridad', label: 'Seguridad', icon: LockKeyhole },
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getFieldError(errors: FieldErrors<ConfiguracionFormValues>, name: Path<ConfiguracionFormValues>): string | undefined {
  let current: unknown = errors;

  for (const segment of name.split('.')) {
    if (!isRecord(current)) return undefined;
    current = current[segment];
  }

  return isRecord(current) && typeof current.message === 'string' ? current.message : undefined;
}

function fieldId(name: Path<ConfiguracionFormValues>): string {
  return `config-${name.split('.').join('-')}`;
}

interface FieldProps {
  register: UseFormRegister<ConfiguracionFormValues>;
  errors: FieldErrors<ConfiguracionFormValues>;
  name: Path<ConfiguracionFormValues>;
  label: string;
  type?: HTMLInputTypeAttribute;
  placeholder?: string;
  readOnly?: boolean;
  registration?: RegisterOptionsForConfig;
}

function TextField({
  register,
  errors,
  name,
  label,
  type = 'text',
  placeholder,
  readOnly = false,
  registration,
}: FieldProps): JSX.Element {
  const error = getFieldError(errors, name);
  const id = fieldId(name);

  return (
    <div>
      <label className="mb-1.5 block text-label uppercase text-ink-500" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        readOnly={readOnly}
        className={clsx(
          'h-10 w-full rounded-md border border-[rgba(42,30,20,0.14)] px-3.5 text-sm text-ink-900 placeholder:text-ink-400 transition focus:border-terracotta-500 focus:ring-4 focus:ring-terracotta-100',
          readOnly && 'bg-cream-100 text-ink-500',
          error && 'border-wine-500 focus:border-wine-500 focus:ring-wine-100',
        )}
        {...register(name, registration)}
      />
      {error ? <p className="mt-1 text-xs text-wine-500">{error}</p> : null}
    </div>
  );
}

interface SelectFieldProps {
  register: UseFormRegister<ConfiguracionFormValues>;
  errors: FieldErrors<ConfiguracionFormValues>;
  name: Path<ConfiguracionFormValues>;
  label: string;
  options: Array<{ value: string; label: string }>;
}

function SelectField({ register, errors, name, label, options }: SelectFieldProps): JSX.Element {
  const error = getFieldError(errors, name);
  const id = fieldId(name);

  return (
    <div>
      <label className="mb-1.5 block text-label uppercase text-ink-500" htmlFor={id}>
        {label}
      </label>
      <select
        id={id}
        className={clsx(
          'h-10 w-full rounded-md border border-[rgba(42,30,20,0.14)] px-3.5 text-sm text-ink-900 transition focus:border-terracotta-500 focus:ring-4 focus:ring-terracotta-100',
          error && 'border-wine-500 focus:border-wine-500 focus:ring-wine-100',
        )}
        {...register(name)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? <p className="mt-1 text-xs text-wine-500">{error}</p> : null}
    </div>
  );
}

interface ToggleFieldProps {
  register: UseFormRegister<ConfiguracionFormValues>;
  name: Path<ConfiguracionFormValues>;
  title: string;
  description: string;
}

function ToggleField({ register, name, title, description }: ToggleFieldProps): JSX.Element {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-md border border-[rgba(42,30,20,0.08)] bg-white px-4 py-3 transition hover:bg-cream-50">
      <span>
        <span className="block text-sm font-semibold text-ink-900">{title}</span>
        <span className="mt-0.5 block text-xs text-ink-500">{description}</span>
      </span>
      <input type="checkbox" className="peer sr-only" {...register(name)} />
      <span className="relative h-6 w-11 rounded-full bg-ink-200 transition after:absolute after:left-1 after:top-1 after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow-sm-soft after:transition peer-checked:bg-terracotta-500 peer-checked:after:translate-x-5" />
    </label>
  );
}

function ConfigSkeleton(): JSX.Element {
  return (
    <div className="space-y-5">
      <div>
        <Skeleton className="h-10 w-[260px]" />
        <Skeleton className="mt-2 h-5 w-[340px]" />
      </div>
      <Skeleton className="h-[72px] rounded-lg" />
      <Skeleton className="h-[420px] rounded-lg" />
    </div>
  );
}

export function ConfigPage(): JSX.Element {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<ConfigTab>('restaurante');

  const configQuery = useQuery({
    queryKey: ['configuracion'],
    queryFn: getConfiguracion,
  });

  const {
    register,
    reset,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ConfiguracionFormValues>({
    resolver: zodResolver(configSchema),
    defaultValues: defaultConfig,
  });

  useEffect(() => {
    if (configQuery.data) {
      reset(configQuery.data);
    }
  }, [configQuery.data, reset]);

  const saveMutation = useMutation({
    mutationFn: (values: ConfiguracionFormValues) => updateConfiguracion(values as Configuracion),
    onSuccess: async (savedConfig) => {
      queryClient.setQueryData(['configuracion'], savedConfig);
      reset(savedConfig);
      showToast({
        variant: 'success',
        title: 'Configuracion guardada',
        description: 'Los cambios del panel admin se actualizaron correctamente.',
      });
    },
    onError: (error) => {
      showToast({
        variant: 'error',
        title: 'No se pudo guardar',
        description: getErrorDetail(error, 'Intenta nuevamente en unos segundos.'),
      });
    },
  });

  async function onSubmit(values: ConfiguracionFormValues): Promise<void> {
    await saveMutation.mutateAsync(values);
  }

  function discardChanges(): void {
    reset(configQuery.data ?? defaultConfig);
  }

  if (configQuery.isLoading) {
    return <ConfigSkeleton />;
  }

  if (configQuery.isError) {
    return (
      <ErrorState
        title="No se pudo cargar la configuracion"
        message={getErrorDetail(configQuery.error, 'No pudimos consultar la configuracion del restaurante.')}
        onRetry={() => {
          void configQuery.refetch();
        }}
      />
    );
  }

  if (!configQuery.data) {
    return <EmptyState title="Sin configuracion" description="El backend no devolvio datos de configuracion para editar." />;
  }

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-md bg-cream-100 text-ink-700">
              <Settings aria-hidden="true" size={20} strokeWidth={1.8} />
            </div>
            <h1 className="font-serif text-[36px] font-semibold leading-tight text-ink-900">Configuracion</h1>
          </div>
          <p className="mt-2 text-sm text-ink-500">Ajustes operativos del restaurante para el panel administrativo.</p>
        </div>
        <div className="flex items-center gap-2 rounded-md border border-[rgba(42,30,20,0.08)] bg-white px-3 py-2 text-xs font-medium text-sage-500 shadow-sm-soft">
          <ShieldCheck aria-hidden="true" size={15} strokeWidth={1.8} />
          Solo administradores
        </div>
      </div>

      <form id="config-form" className="space-y-5 pb-24" onSubmit={(event) => void handleSubmit(onSubmit)(event)}>
        <section className="scrollbar-none overflow-x-auto rounded-lg border border-[rgba(42,30,20,0.08)] bg-white p-2 shadow-sm-soft">
          <div className="flex min-w-max gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  className={clsx(
                    'inline-flex h-10 items-center gap-2 rounded-md px-3.5 text-sm font-semibold transition',
                    isActive ? 'bg-terracotta-50 text-terracotta-600' : 'text-ink-500 hover:bg-cream-100 hover:text-ink-900',
                  )}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon aria-hidden="true" size={16} strokeWidth={1.8} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </section>

        {activeTab === 'restaurante' ? (
          <Card title="Restaurante" meta="Datos fiscales, horarios y parametros peruanos del local.">
            <div className="grid gap-4 md:grid-cols-2">
              <TextField register={register} errors={errors} name="restaurante.nombre_comercial" label="Nombre comercial" />
              <TextField register={register} errors={errors} name="restaurante.ruc" label="RUC" />
              <TextField register={register} errors={errors} name="restaurante.direccion" label="Direccion" />
              <TextField register={register} errors={errors} name="restaurante.telefono" label="Telefono" />
              <TextField register={register} errors={errors} name="restaurante.email" label="Email administrativo" type="email" />
              <TextField register={register} errors={errors} name="restaurante.timezone" label="Zona horaria" readOnly />
              <TextField register={register} errors={errors} name="restaurante.moneda" label="Moneda" readOnly />
              <TextField register={register} errors={errors} name="restaurante.igv_pct" label="IGV (%)" type="number" registration={{ valueAsNumber: true }} />
              <TextField register={register} errors={errors} name="restaurante.horario_apertura" label="Apertura" type="time" />
              <TextField register={register} errors={errors} name="restaurante.horario_cierre" label="Cierre" type="time" />
            </div>
          </Card>
        ) : null}

        {activeTab === 'pagos' ? (
          <Card title="Pagos" meta="Metodos de pago habilitados y comprobante por defecto.">
            <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
              <div className="space-y-3">
                <ToggleField register={register} name="pagos.acepta_efectivo" title="Efectivo" description="Permitir pagos registrados en caja." />
                <ToggleField register={register} name="pagos.acepta_tarjeta" title="Tarjeta" description="Habilitar pagos con POS o pasarela." />
                <ToggleField register={register} name="pagos.acepta_yape" title="Yape" description="Aceptar transferencias Yape para pedidos." />
              </div>
              <div className="grid gap-4">
                <TextField register={register} errors={errors} name="pagos.yape_numero" label="Numero Yape" />
                <TextField register={register} errors={errors} name="pagos.pos_proveedor" label="Proveedor POS" />
                <TextField register={register} errors={errors} name="pagos.propina_sugerida_pct" label="Propina sugerida (%)" type="number" registration={{ valueAsNumber: true }} />
                <SelectField
                  register={register}
                  errors={errors}
                  name="pagos.comprobante_default"
                  label="Comprobante"
                  options={[
                    { value: 'boleta', label: 'Boleta' },
                    { value: 'factura', label: 'Factura' },
                  ]}
                />
              </div>
            </div>
          </Card>
        ) : null}

        {activeTab === 'notificaciones' ? (
          <Card title="Notificaciones" meta="Eventos que el restaurante debe avisar al equipo.">
            <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
              <TextField register={register} errors={errors} name="notificaciones.email_admin" label="Email de alertas" type="email" />
              <div className="space-y-3 lg:row-span-2">
                <ToggleField register={register} name="notificaciones.email_reservas" title="Reservas por email" description="Enviar avisos cuando se registren reservas." />
                <ToggleField register={register} name="notificaciones.resumen_diario_email" title="Resumen diario" description="Enviar cierre operativo al email administrador." />
              </div>
            </div>
          </Card>
        ) : null}

        {activeTab === 'seguridad' ? (
          <Card title="Seguridad" meta="Politicas de sesion y acceso administrativo.">
            <div className="grid gap-4 md:grid-cols-2">
              <TextField register={register} errors={errors} name="seguridad.sesion_minutos" label="Sesion activa (min)" type="number" registration={{ valueAsNumber: true }} />
              <TextField register={register} errors={errors} name="seguridad.intentos_login" label="Intentos de login" type="number" registration={{ valueAsNumber: true }} />
              <TextField register={register} errors={errors} name="seguridad.bloqueo_minutos" label="Bloqueo (min)" type="number" registration={{ valueAsNumber: true }} />
              <TextField register={register} errors={errors} name="seguridad.rotacion_claves_dias" label="Rotacion de claves (dias)" type="number" registration={{ valueAsNumber: true }} />
              <div className="md:col-span-2">
                <ToggleField register={register} name="seguridad.mfa_admin" title="MFA para administradores" description="Solicitar segundo factor para cuentas admin cuando este disponible." />
              </div>
            </div>
          </Card>
        ) : null}
      </form>

      {isDirty ? (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[rgba(42,30,20,0.08)] bg-white/95 px-4 py-3 shadow-lg-soft backdrop-blur">
          <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-ink-500">Tienes cambios sin guardar en la configuracion.</div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={discardChanges}>
                <X aria-hidden="true" size={16} strokeWidth={1.8} />
                Descartar
              </Button>
              <Button type="submit" form="config-form" variant="primary" loading={saveMutation.isPending}>
                <Save aria-hidden="true" size={16} strokeWidth={1.8} />
                Guardar cambios
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
