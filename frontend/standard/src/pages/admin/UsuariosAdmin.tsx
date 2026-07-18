import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence } from 'framer-motion';
import { Plus, Pencil } from 'lucide-react';
import { toast } from 'sonner';

import { actualizarUsuario, crearUsuario, getUsuarios } from '@/api/admin';
import { cn } from '@/lib/utils';
import { ErrorState } from '@/components/ErrorState';
import { Field, Modal, inputClass } from '@/pages/admin/Modal';
import type { UserRole, UsuarioPublico } from '@/types';

const ROLES: UserRole[] = ['cliente', 'mesero', 'cocina', 'admin'];

const rolStyle: Record<UserRole, string> = {
  cliente: 'bg-muted text-muted-foreground',
  mesero: 'bg-status-in-progress/10 text-status-in-progress',
  cocina: 'bg-status-waiting/10 text-status-waiting',
  admin: 'bg-primary/10 text-primary',
};

interface FormState {
  nombre: string;
  email: string;
  telefono: string;
  password: string;
  rol: UserRole;
}

const emptyForm: FormState = { nombre: '', email: '', telefono: '', password: '', rol: 'cliente' };

export function UsuariosAdmin() {
  const queryClient = useQueryClient();
  const { data: usuarios, isLoading, isError, refetch } = useQuery({ queryKey: ['admin-usuarios'], queryFn: getUsuarios });

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<UsuarioPublico | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin-usuarios'] });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editing) {
        return actualizarUsuario(editing.id_usuario, { nombre: form.nombre, telefono: form.telefono || undefined, rol: form.rol });
      }
      return crearUsuario({
        nombre: form.nombre,
        email: form.email,
        telefono: form.telefono || undefined,
        password: form.password,
        rol: form.rol,
      });
    },
    onSuccess: () => {
      toast.success(editing ? 'Usuario actualizado' : 'Usuario creado');
      setModalOpen(false);
      void invalidate();
    },
    onError: () => toast.error('No se pudo guardar el usuario.'),
  });

  const openNew = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (u: UsuarioPublico) => {
    setEditing(u);
    setForm({ nombre: u.nombre, email: u.email, telefono: u.telefono ?? '', password: '', rol: u.rol });
    setModalOpen(true);
  };

  if (isLoading) return <div className="max-w-4xl h-64 rounded-3xl bg-muted animate-pulse" />;
  if (isError || !usuarios) return <ErrorState message="No se pudieron cargar los usuarios." onRetry={() => refetch()} />;

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading text-xl font-semibold">Usuarios · {usuarios.length}</h2>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110 transition shadow-md shadow-primary/20"
        >
          <Plus className="h-4 w-4" /> Nuevo usuario
        </button>
      </div>

      <div className="bg-card rounded-3xl border divide-y">
        {usuarios.map((u) => (
          <div key={u.id_usuario} className="flex items-center gap-4 p-4">
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{u.nombre}</p>
              <p className="text-xs text-muted-foreground truncate">{u.email}</p>
            </div>
            <span className={cn('text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize', rolStyle[u.rol])}>{u.rol}</span>
            <button onClick={() => openEdit(u)} className="p-2 rounded-xl hover:bg-muted transition">
              <Pencil className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        ))}
        {usuarios.length === 0 && <div className="p-8 text-center text-sm text-muted-foreground">Sin usuarios.</div>}
      </div>

      <AnimatePresence>
        {modalOpen && (
          <Modal title={editing ? 'Editar usuario' : 'Nuevo usuario'} onClose={() => setModalOpen(false)}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!form.nombre || (!editing && (!form.email || form.password.length < 8))) {
                  toast.error(editing ? 'El nombre es requerido' : 'Nombre, email y contraseña (mín. 8) son requeridos');
                  return;
                }
                saveMutation.mutate();
              }}
              className="space-y-4"
            >
              <Field label="Nombre">
                <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className={inputClass} />
              </Field>
              <Field label="Email">
                <input
                  type="email"
                  value={form.email}
                  disabled={!!editing}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={cn(inputClass, editing && 'opacity-60 cursor-not-allowed')}
                />
              </Field>
              <Field label="Teléfono (opcional)">
                <input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} className={inputClass} />
              </Field>
              {!editing && (
                <Field label="Contraseña (mín. 8)">
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className={inputClass}
                  />
                </Field>
              )}
              <Field label="Rol">
                <select value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value as UserRole })} className={cn(inputClass, 'capitalize')}>
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </Field>
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
