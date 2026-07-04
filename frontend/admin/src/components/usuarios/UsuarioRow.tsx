import { Pencil, Phone } from 'lucide-react';

import { rolePresentation } from '@/components/usuarios/rolePresentation';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Pill } from '@/components/ui/Pill';
import type { Usuario } from '@/types/api';

interface UsuarioRowProps {
  usuario: Usuario;
  onEdit: (usuario: Usuario) => void;
}

function formatCreatedAt(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function UsuarioRow({ usuario, onEdit }: UsuarioRowProps): JSX.Element {
  const role = rolePresentation[usuario.rol];

  return (
    <tr className="border-b border-dashed border-[rgba(42,30,20,0.08)] last:border-b-0 hover:bg-cream-50/70">
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-3">
          <Avatar label={usuario.nombre} size="lg" />
          <div className="min-w-0">
            <div className="font-semibold text-ink-900">{usuario.nombre}</div>
            <div className="mt-0.5 text-xs text-ink-500 tnum">ID #{usuario.id_usuario}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3.5">
        <div className="text-sm text-ink-900">{usuario.email}</div>
        <div className="mt-1 inline-flex items-center gap-1.5 text-xs text-ink-500">
          <Phone aria-hidden="true" size={13} strokeWidth={1.8} />
          {usuario.telefono ?? 'Sin teléfono'}
        </div>
      </td>
      <td className="px-4 py-3.5">
        <Pill tone={role.tone}>{role.label}</Pill>
      </td>
      <td className="px-4 py-3.5 text-sm text-ink-500 tnum">{formatCreatedAt(usuario.creado_en)}</td>
      <td className="px-4 py-3.5 text-right">
        <Button type="button" size="sm" variant="ghost" onClick={() => onEdit(usuario)}>
          <Pencil aria-hidden="true" size={14} strokeWidth={1.8} />
          Editar
        </Button>
      </td>
    </tr>
  );
}
