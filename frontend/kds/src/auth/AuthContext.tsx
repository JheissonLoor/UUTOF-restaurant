import { useCallback, useMemo, useState, type ReactNode } from 'react'

import { loginCocina } from '@/api/auth'
import { AuthContext, type AuthContextValue } from '@/auth/auth-context'
import { clearSession, getSession, saveSession } from '@/auth/session'
import type { LoginRequest, TokenResponse } from '@/types/api'

function canUseKds(session: TokenResponse | null): session is TokenResponse {
  return session?.usuario.rol === 'cocina' || session?.usuario.rol === 'admin'
}

export function AuthProvider({ children }: { children: ReactNode }): JSX.Element {
  const storedSession = getSession()
  const [session, setSession] = useState<TokenResponse | null>(canUseKds(storedSession) ? storedSession : null)

  const login = useCallback(async (payload: LoginRequest) => {
    const nextSession = await loginCocina(payload)
    if (!canUseKds(nextSession)) {
      throw new Error('Esta cuenta no tiene acceso al KDS Premium.')
    }
    saveSession(nextSession)
    setSession(nextSession)
  }, [])

  const logout = useCallback(() => {
    clearSession()
    setSession(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.usuario ?? null,
      isAuthenticated: session !== null,
      login,
      logout,
    }),
    [login, logout, session],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
