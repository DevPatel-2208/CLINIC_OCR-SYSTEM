import { useQueryClient } from '@tanstack/react-query'
import useAuthStore from '@/store/authStore'
import { useNavigate } from 'react-router-dom'

export function useAuth() {
  const { user, loading, initialized, login, logout, setUser } = useAuthStore()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const isAuthenticated = !!user
  const role = user?.role
  const isAdmin = role === 'ADMIN'
  const isDoctor = role === 'DOCTOR'
  const isReceptionist = role === 'RECEPTIONIST'
  const isPatient = role === 'PATIENT'

  const handleLogout = async () => {
    try { await logout() } finally { queryClient.clear(); navigate('/') }
  }

  const getDashboardPath = () => {
    switch (role) {
      case 'ADMIN': return '/admin/dashboard'
      case 'DOCTOR': return '/doctor/dashboard'
      case 'RECEPTIONIST': return '/receptionist/dashboard'
      case 'PATIENT': return '/patient/dashboard'
      default: return '/'
    }
  }

  return {
    user,
    loading,
    initialized,
    isAuthenticated,
    role,
    isAdmin,
    isDoctor,
    isReceptionist,
    isPatient,
    login,
    logout,
    setUser,
    handleLogout,
    getDashboardPath,
  }
}
