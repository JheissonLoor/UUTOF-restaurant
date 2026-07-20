import { useQuery } from '@tanstack/react-query';
import { getApiErrorMessage } from '../api/errors';
import { getEmpleadosMultilocal } from '../api/operacion';
import { EmpleadosTable } from '../components/empleados/EmpleadosTable';
import { BranchSelector } from '../components/shared/BranchSelector';
import { useSucursal } from '../context/useSucursal';
import { TopBar } from '../layout/TopBar';

export function EmpleadosView() {
  const { sucursalActiva } = useSucursal();
  const branchId = sucursalActiva === 'red' ? undefined : sucursalActiva;
  const query = useQuery({
    queryKey: ['empleados-multilocal', sucursalActiva],
    queryFn: () => getEmpleadosMultilocal(branchId),
  });
  return (
    <section className="animate-view-in" aria-labelledby="titulo-empleados">
      <TopBar title="Empleados" subtitle="Roles, accesos y operación del personal por sucursal" titleId="titulo-empleados" actions={<BranchSelector />} />
      {query.isError ? <p role="alert" className="mb-3 rounded-card border border-danger/25 bg-danger/10 px-4 py-3 text-sm text-danger">{getApiErrorMessage(query.error)}</p> : null}
      <EmpleadosTable employees={query.data} loading={query.isPending} />
    </section>
  );
}
