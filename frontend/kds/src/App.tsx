import { useAuth } from '@/auth/useAuth'
import { Topbar } from '@/components/Topbar'
import { KdsBoard } from '@/pages/KdsBoard'
import { LoginView } from '@/pages/LoginView'

export function App(): JSX.Element {
  const { isAuthenticated, logout, user } = useAuth()

  if (!isAuthenticated) {
    return <LoginView />
  }

  return (
    <div className="grid h-[100dvh] w-screen grid-rows-[60px_60px_minmax(0,1fr)_56px] overflow-hidden bg-bg text-ink">
      <Topbar user={user} onLogout={logout} />
      <KdsBoard />
    </div>
  )
}

export default App
