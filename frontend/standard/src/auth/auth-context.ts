import { createContext } from 'react';

import type { UsuarioSesion } from '@/types';

export interface AuthResult {
  success: boolean;
  error?: string;
}

export interface AuthContextType {
  user: UsuarioSesion | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (data: { nombre: string; email: string; telefono: string; password: string }) => Promise<AuthResult>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);
