import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from "motion"
import { useParams, Link } from 'react-router-dom'
import { fadeUp, fadeScale, staggerContainer, staggerItem, listItem } from '@/motion/variants'
import { ArrowLeft, Stethoscope, Mail, Phone, Activity, Briefcase } from 'lucide-react'
import { adminApi } from '../../services'
import { PageHeader, SectionCard, EmptyState, ErrorState, StatusBadge, Avatar } from '@/components/common'
import { Skeleton } from '@/components/ui'

export default function AdminDoctorDetails() {
  const { id } = useParams()
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-doctor', id],
    queryFn: () => adminApi.getDoctor(id).then((r) => r.data.data),
  })

  if (isLoading) {
    return (
    <div><Skeleton className="will-change-transform h-9 w-40 mb-6" />
        <Skeleton className="h-40 rounded-xl mb-6" />
        <Skeleton className="h-40 rounded-xl" />
      </div>
    )
  }

  if (isError) return <ErrorState title="Unable to load doctor" message="We couldn't retrieve this doctor's profile. Please try again." onRetry={refetch} />
  if (!data) return <EmptyState title="Doctor not found" description="This doctor account may no longer exist." />

  const infoItems = [
    { label: 'Email', value: data.email, icon: Mail },
    { label: 'Phone', value: data.phone || 'Not provided', icon: Phone },
    { label: 'Specialization', value: data.specialization || 'General practice', icon: Briefcase },
    { label: 'Professional Info', value: data.professionalInfo || 'No additional details provided', icon: Activity },
  ]

  return (
    <motion.div initial={fadeUp.initial} animate={fadeUp.animate} transition={fadeUp.animate.transition} className="max-w-5xl mx-auto will-change-transform">
      <div className="mb-4">
        <Link to="/admin/doctors" className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground-muted hover:text-primary-700 transition-colors mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to Doctors
        </Link>
        <PageHeader title="Doctor Profile" description="Account details and professional credentials." breadcrumbs={[{ label: 'Doctors', href: '/admin/doctors' }, { label: data.name }]} />
      </div>

      <div className="card-surface p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <Avatar name={data.name} size="xl" className="rounded-2xl" fallbackBg="bg-primary-100" fallbackColor="text-primary-700" />
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-xl font-bold text-foreground">{data.name}</h2>
              <StatusBadge status={data.status} dot />
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-sm text-foreground-muted">
              <Stethoscope className="h-4 w-4 text-secondary-600" />
              <span>{data.specialization || 'Physician'}</span>
            </div>
          </div>
        </div>
      </div>

      <SectionCard title="Contact & Credentials" description="Primary contact details recorded for this physician.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {infoItems.map((item) => (
            <div key={item.label} className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-surface-muted flex items-center justify-center shrink-0">
                <item.icon className="h-4 w-4 text-foreground-muted" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-foreground-muted uppercase tracking-wide">{item.label}</p>
                <p className="text-sm text-foreground mt-0.5 break-words">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </motion.div>
  )
}
