import useAuthStore from '../../store/authStore'
import { motion, AnimatePresence } from "motion"
import { Mail, Phone, ShieldCheck, User } from 'lucide-react'
import { fadeUp, fadeScale, staggerContainer, staggerItem, listItem } from '@/motion/variants'
import { PageHeader, SectionCard, EmptyState, Avatar } from '@/components/common'
import { Badge } from '@/components/ui'

export default function AdminProfile() {
  const user = useAuthStore((s) => s.user)

  if (!user) {
    return <EmptyState title="No profile found" description="Sign in to view your administrator profile." />
  }

  const infoItems = [
    { label: 'Email', value: user.email || 'Not provided', icon: Mail },
    { label: 'Phone', value: user.phone || 'Not provided', icon: Phone },
    { label: 'Role', value: (user.role || 'admin').replace(/_/g, ' '), icon: ShieldCheck },
  ]

  return (
    <motion.div initial={fadeUp.initial} animate={fadeUp.animate} transition={fadeUp.animate.transition} className=" max-w-5xl mx-auto will-change-transform">
      <PageHeader
        title="Profile"
        description="Your administrator account and access details."
        action={<Badge variant="info"><ShieldCheck className="h-3 w-3 mr-1" />{(user.role || 'admin').replace(/_/g, ' ')}</Badge>}
      />

      <div className="card-surface p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <Avatar name={user.name} size="xl" className="rounded-2xl" fallbackBg="bg-primary-100" fallbackColor="text-primary-700" />
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-foreground">{user.name || 'Administrator'}</h2>
            <p className="text-sm text-foreground-muted mt-1 inline-flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-secondary-600" /> Administrator account
            </p>
          </div>
        </div>
      </div>

      <SectionCard title="Account Details" description="Contact information associated with your account.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {infoItems.map((item) => (
            <div key={item.label} className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-surface-muted flex items-center justify-center shrink-0">
                <item.icon className="h-4 w-4 text-foreground-muted" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-foreground-muted uppercase tracking-wide">{item.label}</p>
                <p className="text-sm text-foreground mt-0.5 capitalize break-words">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </motion.div>
  )
}
