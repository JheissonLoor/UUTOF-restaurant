import type { RendimientoSucursal, SucursalResumen } from '../../types/multilocal';
import { BranchCard } from './BranchCard';

interface BranchGridProps {
  branches?: SucursalResumen[];
  performance?: RendimientoSucursal[];
  loading?: boolean;
  onManage: (branch: SucursalResumen) => void;
}

function BranchCardSkeleton() {
  return (
    <div className="h-[260px] animate-pulse rounded-2xl border border-[#E7DED3] bg-surface p-5">
      <div className="flex gap-3">
        <div className="h-10 w-10 rounded-card bg-bg2" />
        <div className="flex-1">
          <div className="h-5 w-28 rounded bg-bg2" />
          <div className="mt-2 h-3 w-full rounded bg-bg2" />
        </div>
      </div>
      <div className="my-6 h-16 rounded bg-bg2" />
      <div className="flex justify-between">
        <div className="h-6 w-24 rounded-full bg-bg2" />
        <div className="h-8 w-24 rounded bg-bg2" />
      </div>
    </div>
  );
}

export function BranchGrid({
  branches = [],
  performance = [],
  loading = false,
  onManage,
}: BranchGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-4" aria-label="Cargando sucursales">
        {[1, 2, 3].map((item) => <BranchCardSkeleton key={item} />)}
      </div>
    );
  }

  if (branches.length === 0) {
    return (
      <div className="border-y border-[#E7DED3] py-12 text-center text-sm text-ink3">
        Aún no hay sucursales registradas.
      </div>
    );
  }

  const performanceByBranch = new Map(
    performance.map((item) => [item.id_sucursal, item]),
  );

  return (
    <div className="grid grid-cols-3 gap-4">
      {branches.map((branch) => (
        <BranchCard
          key={branch.id_sucursal}
          branch={branch}
          performance={performanceByBranch.get(branch.id_sucursal)}
          onManage={onManage}
        />
      ))}
    </div>
  );
}
