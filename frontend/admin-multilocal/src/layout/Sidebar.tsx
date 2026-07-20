import { LogOut, Star, Utensils } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { useSucursal } from '../context/useSucursal';
import { navigationGroups } from '../navigation';
import type { RolUsuario } from '../types/api';

interface SidebarProps {
  branchCount?: number;
}

const roleLabels: Record<RolUsuario, string> = {
  admin: 'Administrador de red',
  dueno: 'Dueño de la red',
  dueño: 'Dueño de la red',
  gerente_sucursal: 'Gerente de sucursal',
  mesero: 'Mesero',
  cocinero: 'Cocina',
  cliente: 'Cliente',
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

export function Sidebar({ branchCount }: SidebarProps) {
  const { usuario, logout } = useAuth();
  const { sucursales } = useSucursal();
  const effectiveBranchCount = branchCount ?? sucursales.length;
  const initials = usuario ? getInitials(usuario.nombre) : 'UT';
  const branchLabel = effectiveBranchCount
    ? `${roleLabels[usuario?.rol ?? 'admin']} · ${effectiveBranchCount} sucursales`
    : roleLabels[usuario?.rol ?? 'admin'];
  const isBranchManager = usuario?.rol === 'gerente_sucursal';

  return (
    <div className="flex h-full flex-col px-[18px] pb-[22px] pt-[26px] text-bg2">
      <div className="flex flex-wrap items-center gap-[11px] px-2 pb-6">
        <span className="flex h-[34px] w-[34px] items-center justify-center rounded-card bg-coral text-white">
          <Utensils size={18} strokeWidth={2} aria-hidden="true" />
        </span>
        <span className="font-display text-xl font-semibold text-bg2">UTTOF</span>
        <span className="rounded-full bg-gradient-to-br from-sun to-sun-dark px-2 py-[3px] font-mono text-[9px] font-semibold uppercase text-[#221A08]">
          Multi-local
        </span>
      </div>

      <nav aria-label="Navegación principal" className="flex min-h-0 flex-1 flex-col gap-[3px] overflow-y-auto">
        {navigationGroups.map((group, groupIndex) => (
          <div key={group.label ?? `principal-${groupIndex}`} className="contents">
            {group.label ? (
              <p className="px-3 pb-1.5 pt-3.5 font-mono text-[9px] font-semibold uppercase text-bg2/35">
                {group.label}
              </p>
            ) : null}
            {group.items.filter((item) => !isBranchManager || !['/admin/config', '/admin/integraciones', '/admin/marca'].includes(item.path)).map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    [
                      'flex min-h-10 items-center gap-[11px] rounded-[8px] px-3 py-2.5 text-[13.5px] font-medium transition-colors',
                      isActive
                        ? 'bg-coral/15 text-white'
                        : 'text-bg2/60 hover:bg-white/5 hover:text-white',
                    ].join(' ')
                  }
                >
                  <Icon size={16} strokeWidth={1.9} className="shrink-0" aria-hidden="true" />
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  {item.badge === 'sucursales' && effectiveBranchCount ? (
                    <span className="rounded-[5px] bg-plum/20 px-1.5 py-0.5 font-mono text-[9px] text-plum">
                      {effectiveBranchCount}
                    </span>
                  ) : null}
                  {item.premium ? (
                    <Star size={11} className="shrink-0 fill-sun text-sun" aria-label="Función Premium" />
                  ) : null}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="mt-4 flex items-center gap-2.5 rounded-card bg-white/5 p-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-plum-dark text-[11px] font-bold text-white">
          {initials}
        </span>
        <div className="min-w-0 flex-1">
          <strong className="block truncate text-[12.5px] font-semibold text-white">
            {usuario?.nombre ?? 'Usuario UTTOF'}
          </strong>
          <span className="block truncate text-[10.5px] text-bg2/50">{branchLabel}</span>
        </div>
        <button
          type="button"
          onClick={logout}
          title="Cerrar sesión"
          aria-label="Cerrar sesión"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-card text-bg2/45 transition-colors hover:bg-white/10 hover:text-white"
        >
          <LogOut size={16} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
