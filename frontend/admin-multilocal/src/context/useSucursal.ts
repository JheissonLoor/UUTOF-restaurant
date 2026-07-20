import { useContext } from 'react';
import { SucursalContext } from './SucursalContext';

export function useSucursal() {
  const context = useContext(SucursalContext);
  if (!context) {
    throw new Error('useSucursal debe utilizarse dentro de SucursalProvider');
  }
  return context;
}
