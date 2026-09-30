import { Link } from 'react-router-dom'
import { motion } from 'motion'
import { useDashboardAnalytics } from '@/features/analytics'
import { PageHeader, StatCard, SectionCard, EmptyState, ErrorState } from '@/components/common'
import { Skeleton } from '@/components/ui'
import { fadeUp, fadeScale, staggerContainer, staggerItem } from '@/motion/variants'
import { useState, useEffect, useMemo } from 'react'
import { Users, FileText, CalendarClock, UserPlus, Upload, ClipboardList, Search, ArrowRight } from 'lucide-react'
import useAuthStore from '@/store/authStore'
import { getTimeBasedGreeting, getDisplayName } from '@/utils/greeting'

export default function ReceptionistDashboard() {
  const { user, initialized } = useAuthStore()
  const { data, isLoading, isError, refetch } = useDashboardAnalytics()
  const [greeting, setGreeting] = useState(() => getTimeBasedGreeting())
  useEffect(() => { const id = setInterval(() => setGreeting(getTimeBasedGreeting()), 60_000); return () => clearInterval(id) }, [])
  const displayName = useMemo(() => getDisplayName(user), [user])
  const greetingTitle = useMemo(() => {
    if (!initialized) return null
    if (!displayName) return greeting
    return `${greeting}, ${displayName}`
  }, [greeting, displayName, initialized])

  if (isLoading) {
    return (
      <div>
        <Skeleton className="h-9 w-72 mb-2" />
        <Skeleton className="h-4 w-96 mb-8" />
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
        <Skeleton className="h-56 rounded-xl mt-8" />
      </div>
    )
  }

  if (isError) {
    return (
      <ErrorState
        title="Unable to load your dashboard"
        message="We couldn't retrieve your front desk overview. Please try again."
        onRetry={refetch}
      />
    )
  }

  const stats = [
    { label: 'Total Patients', value: data?.totalPatients || 0, icon: Users, color: 'bg-primary-50 text-primary-700', tint: 'blue', accent: 'blue' },
    { label: 'Prescriptions', value: data?.totalPrescriptions || 0, icon: FileText, color: 'bg-cyan-50 text-cyan-700', tint: 'teal', accent: 'teal' },
    { label: 'Upcoming Follow-ups', value: data?.upcomingFollowUps || 0, icon: CalendarClock, color: 'bg-secondary-50 text-secondary-700', tint: 'amber', accent: 'amber' },
  ]

  const quickActions = [
    { label: 'Register Patient', desc: 'Add a new patient record', icon: UserPlus, to: '/receptionist/patients/new', color: 'bg-primary-50 text-primary-700' },
    { label: 'Find Patient', desc: 'Search patient records', icon: Search, to: '/receptionist/patients', color: 'bg-cyan-50 text-cyan-700' },
    { label: 'Upload Document', desc: 'Submit a document for review', icon: Upload, to: '/receptionist/upload', color: 'bg-secondary-50 text-secondary-700' },
    { label: 'Schedule Follow-up', desc: 'Manage follow-up visits', icon: CalendarClock, to: '/receptionist/follow-ups', color: 'bg-cyan-50 text-cyan-700' },
  ]

  return (
    <div>
      <motion.div initial={fadeUp.initial} animate={fadeUp.animate} transition={fadeUp.animate.transition} className="will-change-transform break-words">
        {greetingTitle === null ? <Skeleton className="h-9 w-72 mb-2" /> : (
          <PageHeader
            eyebrow="Front Desk"
            accent="cyan"
            title={greetingTitle}
            description="Here's your front desk workflow at a glance."
          />
        )}
      </motion.div>

      <motion.div variants={staggerContainer(0.04)} initial="initial" animate="animate" className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {quickActions.map((action) => (
          <motion.div key={action.label} variants={staggerItem} className="will-change-transform">
            <Link
              to={action.to}
              className="group text-left card-surface p-5 hover:shadow-card-hover transition-all block"
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${action.color}`}>
                <action.icon className="h-5 w-5" />
              </div>
              <p className="font-semibold text-foreground text-sm">{action.label}</p>
              <p className="text-xs text-foreground-muted mt-0.5">{action.desc}</p>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      <motion.div variants={staggerContainer(0.04)} initial="initial" animate="animate" className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => (
          <motion.div key={stat.label} variants={staggerItem} className="will-change-transform">
            <StatCard label={stat.label} value={stat.value} icon={stat.icon} color={stat.color} tint={stat.tint} accent={stat.accent} />
          </motion.div>
        ))}
      </motion.div>

      <motion.div initial={fadeScale.initial} animate={fadeScale.animate} transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }} className="will-change-transform">
        <SectionCard
          title="Front Desk Overview"
          description="Current activity across the clinic"
          icon={ClipboardList}
          action={
            <Link to="/receptionist/follow-ups" className="text-xs font-medium text-cyan-600 hover:text-cyan-700">
              View follow-ups <ArrowRight className="h-3 w-3 inline" />
            </Link>
          }
        >
          {data ? (
            <motion.div variants={staggerContainer(0.03)} initial="initial" animate="animate" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <motion.div variants={staggerItem} className="bg-surface-muted rounded-xl p-5 will-change-transform">
                <p className="text-2xl font-bold text-foreground">{data.upcomingFollowUps || 0}</p>
                <p className="text-xs font-medium text-foreground-muted mt-1">Upcoming Follow-ups</p>
              </motion.div>
              <motion.div variants={staggerItem} className="bg-surface-muted rounded-xl p-5 will-change-transform">
                <p className="text-2xl font-bold text-foreground">{data.totalPrescriptions || 0}</p>
                <p className="text-xs font-medium text-foreground-muted mt-1">Total Documents Processed</p>
              </motion.div>
            </motion.div>
          ) : (
            <EmptyState title="No activity data yet" description="Register patients and process documents to see activity here." />
          )}
        </SectionCard>
      </motion.div>
    </div>
  )
}
