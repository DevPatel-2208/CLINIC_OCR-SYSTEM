import { Navigate, Outlet } from 'react-router-dom'
import useAuthStore from '../store/authStore'

export default function RoleRoute({ role }) {
  const user = useAuthStore((state) => state.user)

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (user.role !== role) {
    return <Navigate to="/unauthorized" replace />
  }

  return <Outlet />
}