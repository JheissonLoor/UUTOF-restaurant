import { useContext } from 'react';

import { AuthContext, type AuthContextType } from '@/auth/auth-context';

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
