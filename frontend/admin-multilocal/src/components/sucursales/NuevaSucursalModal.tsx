import { useEffect, useState, type FormEvent } from 'react';
import { Building2, X } from 'lucide-react';
import type { NuevaSucursalRequest } from '../../types/multilocal';

interface NuevaSucursalModalProps {
  open: boolean;
  submitting: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (payload: NuevaSucursalRequest) => Promise<void>;
}

const colors: Array<{ value: NuevaSucursalRequest['color']; label: string; classes: string }> = [
  { value: 'coral', label: 'Coral', classes: 'bg-coral' },
  { value: 'mint', label: 'Menta', classes: 'bg-mint-dark' },
  { value: 'sky', label: 'Azul', classes: 'bg-sky-dark' },
  { value: 'plum', label: 'Ciruela', classes: 'bg-plum-dark' },
  { value: 'sun', label: 'Dorado', classes: 'bg-sun-dark' },
];

const initialForm: NuevaSucursalRequest = {
  nombre: '',
  direccion: '',
  color: 'coral',
  mesas: 8,
};

export function NuevaSucursalModal({
  open,
  submitting,
  error,
  onClose,
  onSubmit,
}: NuevaSucursalModalProps) {
  const [form, setForm] = useState<NuevaSucursalRequest>(initialForm);

  useEffect(() => {
    if (!open) {
      setForm(initialForm);
    }
  }, [open]);

  if (!open) {
    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit(form);
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-ink/45 p-6" role="presentation" onMouseDown={onClose}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="nueva-sucursal-titulo"
        onMouseDown={(event) => event.stopPropagation()}
        className="w-full max-w-[520px] rounded-2xl bg-surface shadow-lift"
      >
        <header className="flex items-center justify-between border-b border-[#E7DED3] px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-card bg-coral/10 text-coral-dark">
              <Building2 size={19} aria-hidden="true" />
            </span>
            <h2 id="nueva-sucursal-titulo" className="font-display text-2xl font-semibold text-ink">
              Nueva sucursal
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            title="Cerrar"
            className="flex h-9 w-9 items-center justify-center rounded-card text-ink4 hover:bg-bg2 hover:text-ink"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-ink2">Nombre del local</span>
            <input
              required
              minLength={2}
              maxLength={120}
              value={form.nombre}
              onChange={(event) => setForm((current) => ({ ...current, nombre: event.target.value }))}
              className="h-11 w-full rounded-card border border-[#DDD2C5] bg-white px-3 text-sm text-ink outline-none focus:border-coral"
              placeholder="Ej. Surco"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-ink2">Dirección</span>
            <input
              required
              minLength={5}
              maxLength={240}
              value={form.direccion}
              onChange={(event) => setForm((current) => ({ ...current, direccion: event.target.value }))}
              className="h-11 w-full rounded-card border border-[#DDD2C5] bg-white px-3 text-sm text-ink outline-none focus:border-coral"
              placeholder="Av. Principal 123, Lima"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-ink2">Cantidad de mesas</span>
            <input
              required
              type="number"
              min={1}
              max={100}
              value={form.mesas}
              onChange={(event) => setForm((current) => ({ ...current, mesas: Number(event.target.value) }))}
              className="h-11 w-full rounded-card border border-[#DDD2C5] bg-white px-3 font-mono text-sm text-ink outline-none focus:border-coral"
            />
          </label>
          <fieldset>
            <legend className="mb-2 text-sm font-semibold text-ink2">Color identificador</legend>
            <div className="flex gap-2">
              {colors.map((color) => (
                <label key={color.value} className="cursor-pointer">
                  <input
                    type="radio"
                    name="color"
                    value={color.value}
                    checked={form.color === color.value}
                    onChange={() => setForm((current) => ({ ...current, color: color.value }))}
                    className="sr-only"
                  />
                  <span
                    title={color.label}
                    className={`flex h-10 w-10 items-center justify-center rounded-card border-2 ${
                      form.color === color.value ? 'border-ink' : 'border-transparent'
                    }`}
                  >
                    <span className={`h-6 w-6 rounded-full ${color.classes}`} />
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          {error ? <div role="alert" className="rounded-card bg-danger/10 px-4 py-3 text-sm text-danger">{error}</div> : null}

          <div className="flex justify-end gap-3 border-t border-[#E7DED3] pt-5">
            <button type="button" onClick={onClose} className="h-10 rounded-card border border-[#DDD2C5] px-4 text-sm font-semibold text-ink2 hover:bg-bg2">
              Cancelar
            </button>
            <button type="submit" disabled={submitting} className="h-10 rounded-card bg-ink px-5 text-sm font-semibold text-white hover:bg-ink2 disabled:opacity-60">
              {submitting ? 'Creando...' : 'Crear sucursal'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
