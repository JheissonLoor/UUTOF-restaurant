import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Store, CreditCard, Bell, Shield } from 'lucide-react';
import { toast } from 'sonner';

import { actualizarConfiguracion, getConfiguracion } from '@/api/admin';
import { ErrorState } from '@/components/ErrorState';
import { Field, inputClass } from '@/pages/admin/Modal';
import type { ConfiguracionResponse } from '@/types';

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-3 py-2 text-sm">
      <span>{label}</span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="w-4 h-4 accent-primary" />
    </label>
  );
}

export function ConfigAdmin() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['configuracion'], queryFn: getConfiguracion });
  const [config, setConfig] = useState<ConfiguracionResponse | null>(null);

  useEffect(() => {
    if (data) setConfig(data);
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: () => actualizarConfiguracion(config as ConfiguracionResponse),
    onSuccess: () => {
      toast.success('Configuración guardada');
      void queryClient.invalidateQueries({ queryKey: ['configuracion'] });
    },
    onError: () => toast.error('No se pudo guardar. Revisa los datos (RUC 11 dígitos, horarios HH:MM).'),
  });

  if (isLoading || !config) return <div className="max-w-3xl h-96 rounded-3xl bg-muted animate-pulse" />;
  if (isError) return <ErrorState message="No se pudo cargar la configuración." onRetry={() => refetch()} />;

  const { restaurante, pagos, notificaciones, seguridad } = config;
  const setR = (patch: Partial<typeof restaurante>) => setConfig({ ...config, restaurante: { ...restaurante, ...patch } });
  const setP = (patch: Partial<typeof pagos>) => setConfig({ ...config, pagos: { ...pagos, ...patch } });
  const setN = (patch: Partial<typeof notificaciones>) => setConfig({ ...config, notificaciones: { ...notificaciones, ...patch } });
  const setS = (patch: Partial<typeof seguridad>) => setConfig({ ...config, seguridad: { ...seguridad, ...patch } });

  return (
    <div className="max-w-3xl space-y-6">
      {/* Restaurante */}
      <section className="bg-card rounded-3xl border p-6">
        <h2 className="font-heading text-lg font-semibold mb-4 flex items-center gap-2">
          <Store className="h-5 w-5 text-primary" /> Restaurante
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Nombre comercial">
            <input value={restaurante.nombre_comercial} onChange={(e) => setR({ nombre_comercial: e.target.value })} className={inputClass} />
          </Field>
          <Field label="RUC (11 dígitos)">
            <input value={restaurante.ruc} onChange={(e) => setR({ ruc: e.target.value })} className={inputClass} />
          </Field>
          <Field label="Dirección">
            <input value={restaurante.direccion} onChange={(e) => setR({ direccion: e.target.value })} className={inputClass} />
          </Field>
          <Field label="Teléfono">
            <input value={restaurante.telefono} onChange={(e) => setR({ telefono: e.target.value })} className={inputClass} />
          </Field>
          <Field label="Email">
            <input value={restaurante.email} onChange={(e) => setR({ email: e.target.value })} className={inputClass} />
          </Field>
          <Field label="IGV (%)">
            <input type="number" value={restaurante.igv_pct} onChange={(e) => setR({ igv_pct: Number(e.target.value) })} className={inputClass} />
          </Field>
          <Field label="Apertura (HH:MM)">
            <input value={restaurante.horario_apertura} onChange={(e) => setR({ horario_apertura: e.target.value })} className={inputClass} />
          </Field>
          <Field label="Cierre (HH:MM)">
            <input value={restaurante.horario_cierre} onChange={(e) => setR({ horario_cierre: e.target.value })} className={inputClass} />
          </Field>
        </div>
      </section>

      {/* Pagos */}
      <section className="bg-card rounded-3xl border p-6">
        <h2 className="font-heading text-lg font-semibold mb-4 flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" /> Pagos
        </h2>
        <div className="grid sm:grid-cols-2 gap-x-6">
          <div>
            <Toggle label="Acepta efectivo" checked={pagos.acepta_efectivo} onChange={(v) => setP({ acepta_efectivo: v })} />
            <Toggle label="Acepta tarjeta" checked={pagos.acepta_tarjeta} onChange={(v) => setP({ acepta_tarjeta: v })} />
            <Toggle label="Acepta Yape" checked={pagos.acepta_yape} onChange={(v) => setP({ acepta_yape: v })} />
          </div>
          <div className="space-y-4">
            <Field label="Número Yape">
              <input value={pagos.yape_numero} onChange={(e) => setP({ yape_numero: e.target.value })} className={inputClass} />
            </Field>
            <Field label="Propina sugerida (%)">
              <input
                type="number"
                value={pagos.propina_sugerida_pct}
                onChange={(e) => setP({ propina_sugerida_pct: Number(e.target.value) })}
                className={inputClass}
              />
            </Field>
            <Field label="Comprobante por defecto">
              <select
                value={pagos.comprobante_default}
                onChange={(e) => setP({ comprobante_default: e.target.value as 'boleta' | 'factura' })}
                className={inputClass}
              >
                <option value="boleta">Boleta</option>
                <option value="factura">Factura</option>
              </select>
            </Field>
          </div>
        </div>
      </section>

      {/* Notificaciones */}
      <section className="bg-card rounded-3xl border p-6">
        <h2 className="font-heading text-lg font-semibold mb-4 flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" /> Notificaciones
        </h2>
        <Field label="Email admin">
          <input value={notificaciones.email_admin} onChange={(e) => setN({ email_admin: e.target.value })} className={inputClass} />
        </Field>
        <div className="mt-2">
          <Toggle label="Email de reservas" checked={notificaciones.email_reservas} onChange={(v) => setN({ email_reservas: v })} />
          <Toggle label="Resumen diario por email" checked={notificaciones.resumen_diario_email} onChange={(v) => setN({ resumen_diario_email: v })} />
        </div>
      </section>

      {/* Seguridad */}
      <section className="bg-card rounded-3xl border p-6">
        <h2 className="font-heading text-lg font-semibold mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" /> Seguridad
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Sesión (min, 15–720)">
            <input type="number" value={seguridad.sesion_minutos} onChange={(e) => setS({ sesion_minutos: Number(e.target.value) })} className={inputClass} />
          </Field>
          <Field label="Intentos de login (3–10)">
            <input type="number" value={seguridad.intentos_login} onChange={(e) => setS({ intentos_login: Number(e.target.value) })} className={inputClass} />
          </Field>
          <Field label="Bloqueo (min, 5–120)">
            <input type="number" value={seguridad.bloqueo_minutos} onChange={(e) => setS({ bloqueo_minutos: Number(e.target.value) })} className={inputClass} />
          </Field>
          <Field label="Rotación claves (días, 30–365)">
            <input
              type="number"
              value={seguridad.rotacion_claves_dias}
              onChange={(e) => setS({ rotacion_claves_dias: Number(e.target.value) })}
              className={inputClass}
            />
          </Field>
        </div>
        <div className="mt-2">
          <Toggle label="MFA para administradores" checked={seguridad.mfa_admin} onChange={(v) => setS({ mfa_admin: v })} />
        </div>
      </section>

      <div className="flex justify-end">
        <button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className="px-8 py-3 rounded-2xl bg-primary text-primary-foreground font-semibold hover:brightness-110 transition shadow-md shadow-primary/20 disabled:opacity-60"
        >
          {saveMutation.isPending ? 'Guardando…' : 'Guardar cambios'}
        </button>
      </div>
    </div>
  );
}
