import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from "motion"
import { Building2, Phone, Mail, MapPin, PlusCircle } from 'lucide-react'
import { fadeUp, fadeScale, staggerContainer, staggerItem, listItem } from '@/motion/variants'
import { adminApi } from '../../services'
import { PageHeader, SectionCard, EmptyState, ErrorState } from '@/components/common'
import { Skeleton, Badge } from '@/components/ui'

export default function AdminClinicSettings() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: () => adminApi.getSettings().then((r) => r.data.data),
  })

  if (isLoading) {
    return (
    <div><Skeleton className="will-change-transform h-9 w-56 mb-2" />
        <Skeleton className="h-4 w-96 mb-8" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  if (isError) {
    return <ErrorState title="Unable to load clinic settings" message="We couldn't retrieve your clinic configuration. Please try again." onRetry={refetch} />
  }

  if (!data) {
    return <EmptyState title="No clinic settings" description="Clinic configuration has not been set up yet." className="py-10" />
  }

  const infoItems = [
    { label: 'Clinic Name', value: data.name, icon: Building2, color: 'bg-primary-50 text-primary-700' },
    { label: 'Phone', value: data.phone, icon: Phone, color: 'bg-secondary-50 text-secondary-700' },
    { label: 'Email', value: data.email, icon: Mail, color: 'bg-info-surface text-info' },
    { label: 'Address', value: data.address, icon: MapPin, color: 'bg-accent-50 text-accent-600' },
  ]

  return (
    <motion.div initial={fadeUp.initial} animate={fadeUp.animate} transition={fadeUp.animate.transition} className="max-w-5xl mx-auto will-change-transform">
      <PageHeader
        title="Clinic Settings"
        description="General configuration and contact details for your clinic."
        action={<Badge variant="info"><PlusCircle className="h-3 w-3 mr-1" /> {data.name || 'Clinic'}</Badge>}
      />

      <SectionCard title="Clinic Details" description="Primary information used across the platform.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {infoItems.map((item) => (
            <div key={item.label} className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                <item.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-foreground-muted uppercase tracking-wide">{item.label}</p>
                <p className="text-sm text-foreground mt-0.5 break-words">{item.value || 'Not provided'}</p>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </motion.div>
  )
}
