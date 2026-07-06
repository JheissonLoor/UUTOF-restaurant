import { useState } from 'react'

import { getErrorDetail } from '@/api/errors'
import { useAuth } from '@/auth/useAuth'
import { FlameIcon } from '@/components/icons'

export function LoginView(): JSX.Element {
  const { login } = useAuth()
  const [email, setEmail] = useState('cocina@uttof.pe')
  const [password, setPassword] = useState('cocina123')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    setError(null)
    setIsLoading(true)
    try {
      await login({ email, password })
    } catch (loginError) {
      setError(getErrorDetail(loginError, 'No se pudo iniciar sesión en KDS.'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="grid h-[100dvh] place-items-center bg-bg px-6 text-ink">
      <form onSubmit={(event) => void handleSubmit(event)} className="w-full max-w-[420px] rounded-xl border border-white/[0.08] bg-surface p-6 shadow-[0_24px_80px_-32px_rgba(0,0,0,0.9)]">
        <div className="mb-6 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-md bg-coral text-white">
            <FlameIcon size={20} />
          </div>
          <div>
            <h1 className="font-serif text-[26px] font-semibold leading-none">UTTOF KDS</h1>
            <p className="mt-1 text-sm text-ink-3">Cocina Premium</p>
          </div>
        </div>

        <label className="block text-xs font-semibold uppercase tracking-[0.08em] text-ink-3" htmlFor="email">Correo</label>
        <input
          id="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mt-2 h-12 w-full rounded-sm border border-white/[0.12] bg-bg px-3 text-sm text-ink outline-none focus:border-coral"
          autoComplete="username"
        />

        <label className="mt-4 block text-xs font-semibold uppercase tracking-[0.08em] text-ink-3" htmlFor="password">Contraseña</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-2 h-12 w-full rounded-sm border border-white/[0.12] bg-bg px-3 text-sm text-ink outline-none focus:border-coral"
          autoComplete="current-password"
        />

        {error ? <div className="mt-4 rounded-sm border border-danger/50 bg-danger/10 px-3 py-2 text-sm text-danger">{error}</div> : null}

        <button type="submit" disabled={isLoading} className="mt-5 h-12 w-full rounded-sm bg-coral px-4 text-sm font-semibold text-white transition hover:bg-coral-600 disabled:opacity-60">
          {isLoading ? 'Entrando...' : 'Entrar a cocina'}
        </button>
      </form>
    </main>
  )
}
