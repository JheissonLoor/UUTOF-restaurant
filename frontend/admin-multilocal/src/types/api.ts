export type RolUsuario =
  | 'admin'
  | 'dueno'
  | 'dueño'
  | 'gerente_sucursal'
  | 'mesero'
  | 'cocinero'
  | 'cliente';

export interface UsuarioSesion {
  id_usuario: number;
  email: string;
  nombre: string;
  telefono?: string | null;
  rol: RolUsuario;
  id_sucursal?: number | null;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type?: string;
  usuario: UsuarioSesion;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshRequest {
  refresh_token: string;
}

export interface RefreshResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type?: string;
  usuario?: UsuarioSesion;
}

export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
}
