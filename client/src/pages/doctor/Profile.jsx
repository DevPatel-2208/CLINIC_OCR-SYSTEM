import useAuthStore from '../../store/authStore'
import { PageHeader, Avatar } from '@/components/common'
import { Mail, Shield, Stethoscope, Phone, BadgeCheck } from 'lucide-react'

export default function DoctorProfile() {
  const user = useAuthStore((s) => s.user)

  const details = [
    { label: 'Email', value: user?.email || '—', icon: Mail },
    { label: 'Role', value: user?.role || 'Doctor', icon: Shield },
    { label: 'Specialization', value: user?.specialization || 'N/A', icon: Stethoscope },
    { label: 'Phone', value: user?.phone || 'N/A', icon: Phone },
  ]

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <PageHeader
        title="Profile"
        description="Your account and clinical profile information."
      />

      <div className="card-surface overflow-hidden">
        {/* Header */}
        <div className="px-6 py-6 bg-gradient-to-b from-primary-50/60 to-surface border-b border-border-subtle flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <Avatar name={user?.name} size="xl" />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-foreground">{user?.name || 'Doctor'}</h2>
              <BadgeCheck className="h-5 w-5 text-secondary-600" />
            </div>
            <p className="text-sm text-foreground-muted mt-0.5">{user?.specialization || 'General Practice'} · {user?.role || 'Doctor'}</p>
          </div>
        </div>

        {/* Details */}
        <div className="px-6 py-4 divide-y divide-border-subtle">
          {details.map((d) => (
            <div key={d.label} className="flex items-center gap-4 py-3.5">
              <div className="w-9 h-9 bg-primary-50 text-primary-700 rounded-lg flex items-center justify-center shrink-0">
                <d.icon className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-foreground-muted uppercase tracking-wide">{d.label}</p>
                <p className="text-sm font-medium text-foreground mt-0.5">{d.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
