import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSucursales } from '../api/sucursales';
import { useAuth } from '../auth/useAuth';
import type { SucursalResumen } from '../types/multilocal';

const STORAGE_KEY = 'uttof_multilocal_sucursal_activa';

export type SucursalActiva = number | 'red';

interface SucursalContextValue {
  sucursalActiva: SucursalActiva;
  setSucursal: (sucursal: SucursalActiva) => void;
  selectorBloqueado: boolean;
  sucursales: SucursalResumen[];
  sucursalesLoading: boolean;
}

export const SucursalContext = createContext<SucursalContextValue | null>(null);

function readStoredSucursal(): SucursalActiva {
  const storedValue = localStorage.getItem(STORAGE_KEY);
  if (!storedValue || storedValue === 'red') {
    return 'red';
  }

  const parsedValue = Number(storedValue);
  return Number.isInteger(parsedValue) && parsedValue > 0 ? parsedValue : 'red';
}

export function SucursalProvider({ children }: PropsWithChildren) {
  const { usuario } = useAuth();
  const branchesQuery = useQuery({
    queryKey: ['sucursales'],
    queryFn: getSucursales,
    staleTime: 60_000,
  });
  const assignedBranch = usuario?.rol === 'gerente_sucursal' ? usuario.id_sucursal : null;
  const selectorBloqueado = Boolean(assignedBranch);
  const [selectedBranch, setSelectedBranch] = useState<SucursalActiva>(readStoredSucursal);
  const sucursalActiva = assignedBranch ?? selectedBranch;

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(sucursalActiva));
  }, [sucursalActiva]);

  const setSucursal = useCallback(
    (sucursal: SucursalActiva) => {
      if (assignedBranch) {
        setSelectedBranch(assignedBranch);
        return;
      }
      setSelectedBranch(sucursal);
    },
    [assignedBranch],
  );

  const value = useMemo<SucursalContextValue>(
    () => ({
      sucursalActiva,
      setSucursal,
      selectorBloqueado,
      sucursales: branchesQuery.data ?? [],
      sucursalesLoading: branchesQuery.isPending,
    }),
    [branchesQuery.data, branchesQuery.isPending, selectorBloqueado, setSucursal, sucursalActiva],
  );

  return <SucursalContext.Provider value={value}>{children}</SucursalContext.Provider>;
}
