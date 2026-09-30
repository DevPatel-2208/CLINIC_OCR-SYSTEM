import { Navigate, Outlet } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import { LoadingState } from '@/components/common'

export default function ProtectedRoute() {
  const user = useAuthStore((state) => state.user)
  const initialized = useAuthStore((state) => state.initialized)

  if (!initialized) {
    return <div className="min-h-screen grid place-items-center"><LoadingState message="Restoring your secure session..." /></div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
