import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from "motion"
import { useAuth } from '@/features/auth'
import { fadeUp, fadeScale, staggerContainer, staggerItem, listItem } from '@/motion/variants'
import { patientApi } from '../../services'
import { PageHeader, EmptyState, ErrorState, Avatar, SectionCard } from '@/components/common'
import { Skeleton } from '@/components/ui'
import { Mail, Phone, MapPin, Calendar, Shield, Heart, User } from 'lucide-react'
import { calculateAge } from '@/features/patients'

export default function PatientMyProfile() {
  const { user } = useAuth()

  const { data: me, isLoading, isError, refetch } = useQuery({
    queryKey: ['patient-me'],
    queryFn: () => patientApi.getMe().then((r) => r.data.data),
  })

  if (isLoading) {
    return (
    <div><Skeleton className="will-change-transform h-9 w-40 mb-2" />
        <Skeleton className="h-4 w-72 mb-8" />
        <Skeleton className="h-40 rounded-xl mb-6" />
        <Skeleton className="h-56 rounded-xl" />
      </div>
    )
  }

  if (isError) return <ErrorState title="Unable to load your profile" message="We couldn't retrieve your profile. Please try again." onRetry={refetch} />

  const profile = me || {}
  const age = profile.dateOfBirth ? calculateAge(profile.dateOfBirth) : null

  const personal = [
    { label: 'Phone', value: profile.phone || 'N/A', icon: Phone },
    { label: 'Email', value: profile.email || user?.email || 'N/A', icon: Mail },
    { label: 'Gender', value: profile.gender ? (profile.gender === 'MALE' ? 'Male' : profile.gender === 'FEMALE' ? 'Female' : 'Other') : 'N/A', icon: User },
    { label: 'Date of Birth', value: profile.dateOfBirth ? <span><Calendar className="h-3.5 w-3.5 inline mr-1" />{age != null ? `${age} years` : 'N/A'}</span> : 'N/A', icon: Calendar },
    { label: 'Address', value: profile.address || 'N/A', icon: MapPin },
    { label: 'Blood Group', value: profile.bloodGroup || 'N/A', icon: Heart },
  ]

  return (
    <motion.div initial={fadeUp.initial} animate={fadeUp.animate} transition={fadeUp.animate.transition} className="max-w-2xl mx-auto will-change-transform">
      <PageHeader title="My Profile" description="Your personal and health information" />

      <div className="card-surface p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Avatar name={user?.name} size="xl" />
          <div>
            <h2 className="text-xl font-bold text-foreground">{user?.name}</h2>
            <span className="inline-flex items-center gap-1 text-xs text-secondary-700 bg-secondary-50 border border-secondary-200 rounded-full px-2.5 py-0.5 mt-1">
              <Shield className="h-3 w-3" /> Patient
            </span>
          </div>
        </div>
      </div>

      <SectionCard title="Personal Information" description="Contact and health details we have on file">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {personal.map((d) => (
            <div key={d.label} className="flex items-start gap-3">
              <div className="w-9 h-9 bg-primary-50 text-primary-700 rounded-lg flex items-center justify-center shrink-0">
                <d.icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-foreground-muted uppercase tracking-wide">{d.label}</p>
                <p className="text-sm text-foreground mt-0.5">{d.value}</p>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </motion.div>
  )
}
