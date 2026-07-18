import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence } from 'framer-motion';
import { Plus, Pencil } from 'lucide-react';
import { toast } from 'sonner';

import { actualizarPlatillo, crearPlatillo, getPlatillosAdmin } from '@/api/admin';
import { getCategorias } from '@/api/menu';
import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/utils';
import { ErrorState } from '@/components/ErrorState';
import { Field, Modal, inputClass } from '@/pages/admin/Modal';
import type { PlatilloApi } from '@/types';

interface FormState {
  nombre: string;
  id_categoria: number | '';
  precio: string;
  disponible: boolean;
  imagen_url: string;
}

const emptyForm: FormState = { nombre: '', id_categoria: '', precio: '', disponible: true, imagen_url: '' };

export function MenuAdmin() {
  const queryClient = useQueryClient();
  const { data: platillos, isLoading, isError, refetch } = useQuery({ queryKey: ['admin-menu'], queryFn: getPlatillosAdmin });
  const { data: categorias } = useQuery({ queryKey: ['categorias'], queryFn: getCategorias });

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<PlatilloApi | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin-menu'] });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        nombre: form.nombre,
        id_categoria: Number(form.id_categoria),
        precio: Number(form.precio),
        disponible: form.disponible,
        imagen_url: form.imagen_url || null,
      };
      return editing ? actualizarPlatillo(editing.id_platillo, payload) : crearPlatillo(payload);
    },
    onSuccess: () => {
      toast.success(editing ? 'Platillo actualizado' : 'Platillo creado');
      setModalOpen(false);
      void invalidate();
    },
    onError: () => toast.error('No se pudo guardar el platillo.'),
  });

  const toggleMutation = useMutation({
    mutationFn: (p: PlatilloApi) => actualizarPlatillo(p.id_platillo, { disponible: !p.disponible }),
    onSuccess: () => void invalidate(),
    onError: () => toast.error('No se pudo cambiar la disponibilidad.'),
  });

  const openNew = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (p: PlatilloApi) => {
    setEditing(p);
    setForm({
      nombre: p.nombre,
      id_categoria: p.id_categoria ?? '',
      precio: String(p.precio),
      disponible: p.disponible,
      imagen_url: p.imagen_url ?? '',
    });
    setModalOpen(true);
  };

  const categoriaNombre = (id: number | null) => categorias?.find((c) => c.id_categoria === id)?.nombre ?? '—';

  if (isLoading) return <div className="max-w-4xl h-64 rounded-3xl bg-muted animate-pulse" />;
  if (isError || !platillos) return <ErrorState message="No se pudo cargar el menú." onRetry={() => refetch()} />;

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading text-xl font-semibold">Menú · {platillos.length} platillos</h2>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110 transition shadow-md shadow-primary/20"
        >
          <Plus className="h-4 w-4" /> Nuevo platillo
        </button>
      </div>

      <div className="bg-card rounded-3xl border divide-y">
        {platillos.map((p) => (
          <div key={p.id_platillo} className="flex items-center gap-4 p-4">
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{p.nombre}</p>
              <p className="text-xs text-muted-foreground">{categoriaNombre(p.id_categoria)}</p>
            </div>
            <span className="font-heading font-bold text-primary">{formatCurrency(p.precio)}</span>
            <button
              onClick={() => toggleMutation.mutate(p)}
              className={cn(
                'text-[11px] font-semibold px-2.5 py-1 rounded-full transition',
                p.disponible ? 'bg-status-paid/10 text-status-paid' : 'bg-muted text-muted-foreground',
              )}
            >
              {p.disponible ? 'Disponible' : 'Agotado'}
            </button>
            <button onClick={() => openEdit(p)} className="p-2 rounded-xl hover:bg-muted transition">
              <Pencil className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        ))}
        {platillos.length === 0 && <div className="p-8 text-center text-sm text-muted-foreground">Sin platillos aún.</div>}
      </div>

      <AnimatePresence>
        {modalOpen && (
          <Modal title={editing ? 'Editar platillo' : 'Nuevo platillo'} onClose={() => setModalOpen(false)}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!form.nombre || !form.id_categoria || !form.precio) {
                  toast.error('Completa nombre, categoría y precio');
                  return;
                }
                saveMutation.mutate();
              }}
              className="space-y-4"
            >
              <Field label="Nombre">
                <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className={inputClass} />
              </Field>
              <Field label="Categoría">
                <select
                  value={form.id_categoria}
                  onChange={(e) => setForm({ ...form, id_categoria: e.target.value ? Number(e.target.value) : '' })}
                  className={inputClass}
                >
                  <option value="">Selecciona…</option>
                  {categorias?.map((c) => (
                    <option key={c.id_categoria} value={c.id_categoria}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Precio (S/)">
                <input
                  type="number"
                  step="0.10"
                  min="0"
                  value={form.precio}
                  onChange={(e) => setForm({ ...form, precio: e.target.value })}
                  className={inputClass}
                />
              </Field>
              <Field label="Imagen (URL, opcional)">
                <input value={form.imagen_url} onChange={(e) => setForm({ ...form, imagen_url: e.target.value })} className={inputClass} />
              </Field>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.disponible}
                  onChange={(e) => setForm({ ...form, disponible: e.target.checked })}
                  className="w-4 h-4 accent-primary"
                />
                Disponible
              </label>
              <button
                type="submit"
                disabled={saveMutation.isPending}
                className="w-full py-3 rounded-2xl bg-primary text-primary-foreground font-semibold hover:brightness-110 transition shadow-md shadow-primary/20 disabled:opacity-60"
              >
                {saveMutation.isPending ? 'Guardando…' : 'Guardar'}
              </button>
            </form>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}
