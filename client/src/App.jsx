import AppRoutes from './routes/AppRoutes'
import { useEffect } from 'react'
import useAuthStore from './store/authStore'
import { setSessionExpiredHandler } from './services/api'

function App() {
  const hydrate = useAuthStore((state) => state.hydrate)
  const setUnauthenticated = useAuthStore((state) => state.setUnauthenticated)

  useEffect(() => {
    // When an authenticated session expires mid-request, transition the auth
    // state to unauthenticated so ProtectedRoute redirects to /login via React
    // Router (no hard page reload, which would cause an infinite reload loop).
    setSessionExpiredHandler(() => setUnauthenticated())
  }, [setUnauthenticated])

  useEffect(() => {
    hydrate()
  }, [hydrate])

  return <AppRoutes />
}

export default App
