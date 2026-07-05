import type { TokenResponse } from '@/types';

const SESSION_KEY = 'uttof_cliente_session';

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
  const raw = window.localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    return isSession(parsed) ? parsed : null;
  } catch {
    window.localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export function saveSession(session: TokenResponse): void {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  window.localStorage.removeItem(SESSION_KEY);
}

export function getAccessToken(): string | null {
  return getSession()?.access_token ?? null;
}

export function getRefreshToken(): string | null {
  return getSession()?.refresh_token ?? null;
}
