import { fmtSoles } from '../../lib/format';
import type { EmpleadoMultilocal } from '../../types/multilocal';

interface EmpleadosTableProps {
  employees?: EmpleadoMultilocal[];
  loading?: boolean;
}

const roleLabels: Record<EmpleadoMultilocal['rol'], string> = {
  mesero: 'Mesero',
  cocina: 'Cocina',
  gerente_sucursal: 'Gerente local',
};

const roleClasses: Record<EmpleadoMultilocal['rol'], string> = {
  mesero: 'bg-coral/10 text-coral-dark',
  cocina: 'bg-sun/15 text-sun-dark',
  gerente_sucursal: 'bg-plum/10 text-plum-dark',
};

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('');
}

export function EmpleadosTable({ employees = [], loading = false }: EmpleadosTableProps) {
  return (
    <section className="overflow-hidden rounded-card border border-[#E7DED3] bg-surface shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-[13px]">
          <thead><tr className="bg-[#FCF9F5] text-left font-mono text-[9px] font-semibold uppercase text-ink4"><th className="px-4 py-3">Nombre</th><th className="px-4 py-3">Rol</th><th className="px-4 py-3">Sucursal</th><th className="px-4 py-3 text-right">Ventas turno</th><th className="px-4 py-3 text-center">Estado</th></tr></thead>
          <tbody>
            {loading ? [1, 2, 3, 4].map((row) => <tr key={row} className="animate-pulse border-t border-[#EEE6DC]"><td colSpan={5} className="px-4 py-4"><div className="h-4 rounded bg-bg2" /></td></tr>) : null}
            {!loading && employees.length === 0 ? <tr><td colSpan={5} className="px-4 py-14 text-center text-sm text-ink3">No hay personal asignado a esta selección.</td></tr> : null}
            {!loading ? employees.map((employee) => (
              <tr key={employee.id_usuario} className="border-t border-[#EEE6DC] text-ink2">
                <td className="px-4 py-3.5"><div className="flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-card bg-ink text-[10px] font-bold text-white">{initials(employee.nombre)}</span><span><strong className="block font-semibold text-ink">{employee.nombre}</strong><span className="text-[10px] text-ink4">{employee.email}</span></span></div></td>
                <td className="px-4 py-3.5"><span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${roleClasses[employee.rol]}`}>{roleLabels[employee.rol]}</span></td>
                <td className="px-4 py-3.5">{employee.sucursal}</td>
                <td className="px-4 py-3.5 text-right font-mono font-semibold tabular-nums">{employee.rol === 'mesero' ? fmtSoles(employee.ventas_turno) : '—'}</td>
                <td className="px-4 py-3.5 text-center"><span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${employee.activo ? 'bg-mint/10 text-mint-dark' : 'bg-bg2 text-ink4'}`}>{employee.activo ? 'Activo' : 'Inactivo'}</span></td>
              </tr>
            )) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
