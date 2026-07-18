import { createContext } from 'react';

import type { LoginRequest, UsuarioSesion } from '@/types';

export interface AuthContextValue {
  user: UsuarioSesion | null;
  isAuthenticated: boolean;
  login: (payload: LoginRequest) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
