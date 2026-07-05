import { createContext } from 'react';

import type { TokenResponse, UsuarioSesion } from '@/types';

export interface AuthContextValue {
  session: TokenResponse | null;
  user: UsuarioSesion | null;
  isReady: boolean;
  error: string | null;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
