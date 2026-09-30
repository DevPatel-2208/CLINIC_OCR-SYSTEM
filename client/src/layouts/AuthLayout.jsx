import { Outlet, Navigate, useLocation } from 'react-router-dom'
import { motion } from "motion"
import useAuthStore from '../store/authStore'
import { fadeUp } from '@/motion/variants'

const PUBLIC_WHEN_AUTHED = ['/forgot-password', '/reset-password']

export default function AuthLayout() {
  const user = useAuthStore((state) => state.user)
  const location = useLocation()

  if (user && !PUBLIC_WHEN_AUTHED.includes(location.pathname)) {
    const home = { ADMIN: '/admin/dashboard', DOCTOR: '/doctor/dashboard', RECEPTIONIST: '/receptionist/dashboard', PATIENT: '/patient/dashboard' }
    return <Navigate to={home[user.role] || '/doctor/dashboard'} replace />
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, ease: [0.16,1,0.3,1] }} className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#0a2540] via-[#123B5D] to-[#0F4C46] flex items-center justify-center p-4">
      <div className="absolute inset-0 hero-grid-pattern opacity-100 pointer-events-none" />
      <div className="pointer-events-none absolute -top-32 -left-24 h-96 w-96 rounded-full bg-cyan-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-24 h-[26rem] w-[26rem] rounded-full bg-secondary-500/15 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/20" />
      <main className="relative w-full flex justify-center">
        <Outlet />
      </main>
    </motion.div>
  )
}
