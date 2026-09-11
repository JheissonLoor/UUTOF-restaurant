import { createContext } from 'react';

import type { LoginRequest, RegisterRequest, TokenResponse, UsuarioSesion } from '@/types';

export interface AuthContextValue {
  session: TokenResponse | null;
  user: UsuarioSesion | null;
  isReady: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  login: (payload: LoginRequest) => Promise<TokenResponse>;
  register: (payload: RegisterRequest) => Promise<TokenResponse>;
  upgradeGuest: (payload: RegisterRequest) => Promise<TokenResponse>;
  acceptSession: (session: TokenResponse) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
