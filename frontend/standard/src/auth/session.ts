import type { TokenResponse } from '@/types';

const SESSION_KEY = 'uttof_standard_session';
const LEGACY_SESSION_KEY = 'uttof_cliente_session';

function isSession(value: unknown): value is TokenResponse {
  if (typeof value !== 'object' || value === null) return false;
  const session = value as Partial<TokenResponse>;
  return (
    typeof session.access_token === 'string' &&
    typeof session.refresh_token === 'string' &&
    typeof session.usuario === 'object' &&
    session.usuario !== null
  );
}

export function getSession(): TokenResponse | null {
  const raw = window.sessionStorage.getItem(SESSION_KEY);
  window.localStorage.removeItem(SESSION_KEY);
  window.localStorage.removeItem(LEGACY_SESSION_KEY);
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isSession(parsed)) return null;
    return parsed;
  } catch {
    window.sessionStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export function saveSession(session: TokenResponse): void {
  window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  window.localStorage.removeItem(SESSION_KEY);
  window.localStorage.removeItem(LEGACY_SESSION_KEY);
}

export function clearSession(): void {
  window.sessionStorage.removeItem(SESSION_KEY);
  window.localStorage.removeItem(SESSION_KEY);
  window.localStorage.removeItem(LEGACY_SESSION_KEY);
}

export function getAccessToken(): string | null {
  return getSession()?.access_token ?? null;
}

export function getRefreshToken(): string | null {
  return getSession()?.refresh_token ?? null;
}
