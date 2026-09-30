import useAuthStore from '../../store/authStore'
import { motion, AnimatePresence } from "motion"
import { PageHeader, Avatar, SectionCard } from '@/components/common'
import { fadeUp, fadeScale, staggerContainer, staggerItem, listItem } from '@/motion/variants'
import { Mail, Phone, Shield, User, BadgeCheck } from 'lucide-react'

export default function ReceptionistProfile() {
  const user = useAuthStore((s) => s.user)

  const roleLabel = (role) => {
    switch (role) {
      case 'RECEPTIONIST': return 'Receptionist'
      case 'ADMIN': return 'Administrator'
      case 'DOCTOR': return 'Doctor'
      case 'PATIENT': return 'Patient'
      default: return role
    }
  }

  const details = [
    { label: 'Email', value: user?.email || 'N/A', icon: Mail },
    { label: 'Phone', value: user?.phone || 'N/A', icon: Phone },
    { label: 'Role', value: roleLabel(user?.role), icon: Shield },
    { label: 'Username', value: user?.username || 'N/A', icon: User },
  ]

  return (
    <motion.div initial={fadeUp.initial} animate={fadeUp.animate} transition={fadeUp.animate.transition} className=" max-w-2xl mx-auto will-change-transform">
      <PageHeader title="My Profile" description="Your clinic staff account details" />

      <div className="card-surface p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Avatar name={user?.name} size="xl" />
          <div>
            <h2 className="text-xl font-bold text-foreground">{user?.name}</h2>
            <span className="inline-flex items-center gap-1 text-xs text-secondary-700 bg-secondary-50 border border-secondary-200 rounded-full px-2.5 py-0.5 mt-1">
              <BadgeCheck className="h-3 w-3" /> {roleLabel(user?.role)}
            </span>
          </div>
        </div>
      </div>

      <SectionCard title="Account Information" description="Contact and authentication details">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {details.map((d) => (
            <div key={d.label} className="flex items-start gap-3">
              <div className="w-9 h-9 bg-primary-50 text-primary-700 rounded-lg flex items-center justify-center shrink-0">
                <d.icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-foreground-subtle uppercase tracking-wide">{d.label}</p>
                <p className="text-sm text-foreground mt-0.5">{d.value}</p>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </motion.div>
  )
}
