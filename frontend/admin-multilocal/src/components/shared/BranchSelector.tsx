import { Building2 } from 'lucide-react';
import { useSucursal } from '../../context/useSucursal';

interface BranchSelectorProps {
  allowNetwork?: boolean;
  compact?: boolean;
}

export function BranchSelector({ allowNetwork = true, compact = false }: BranchSelectorProps) {
  const {
    sucursalActiva,
    setSucursal,
    selectorBloqueado,
    sucursales,
    sucursalesLoading,
  } = useSucursal();

  if (sucursalesLoading) {
    return <div className="h-10 w-56 animate-pulse rounded-[8px] bg-bg2" aria-label="Cargando sucursales" />;
  }

  const visibleBranches = selectorBloqueado
    ? sucursales.filter((branch) => branch.id_sucursal === sucursalActiva)
    : sucursales;

  return (
    <div className={`inline-flex items-center gap-1 rounded-[8px] bg-bg2 p-1 ${compact ? 'max-w-[420px]' : 'max-w-[620px]'}`}>
      <Building2 size={15} className="ml-1 shrink-0 text-ink4" aria-hidden="true" />
      {allowNetwork && !selectorBloqueado ? (
        <button
          type="button"
          onClick={() => setSucursal('red')}
          className={`h-8 shrink-0 rounded-[8px] px-3 text-xs font-semibold transition-colors ${
            sucursalActiva === 'red' ? 'bg-white text-ink shadow-sm' : 'text-ink3 hover:text-ink'
          }`}
        >
          Toda la red
        </button>
      ) : null}
      <div className="flex min-w-0 gap-1 overflow-x-auto">
        {visibleBranches.map((branch) => (
          <button
            key={branch.id_sucursal}
            type="button"
            disabled={selectorBloqueado}
            onClick={() => setSucursal(branch.id_sucursal)}
            className={`h-8 shrink-0 rounded-[8px] px-3 text-xs font-semibold transition-colors ${
              sucursalActiva === branch.id_sucursal
                ? 'bg-white text-ink shadow-sm'
                : 'text-ink3 hover:text-ink disabled:cursor-default'
            }`}
          >
            {branch.nombre}
          </button>
        ))}
      </div>
    </div>
  );
}
