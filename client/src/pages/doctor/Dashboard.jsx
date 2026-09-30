import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'motion'
import { useDashboardAnalytics } from '@/features/analytics'
import { PageHeader, StatCard, SectionCard, EmptyState, ErrorState } from '@/components/common'
import { Skeleton } from '@/components/ui'
import { fadeUp, fadeScale, staggerContainer, staggerItem } from '@/motion/variants'
import { useState, useEffect, useMemo } from 'react'
import {
  Users, FileText, AlertTriangle, CalendarClock, Sparkles, Upload, Search, MessageSquareText,
  ArrowRight, ClipboardList,
} from 'lucide-react'
import useAuthStore from '@/store/authStore'
import { getTimeBasedGreeting, getDoctorDisplayName } from '@/utils/greeting'

export default function DoctorDashboard() {
  const navigate = useNavigate()
  const { user, initialized } = useAuthStore()
  const { data, isLoading, isError, refetch } = useDashboardAnalytics()
  const [greeting, setGreeting] = useState(() => getTimeBasedGreeting())
  useEffect(() => {
    const id = setInterval(() => setGreeting(getTimeBasedGreeting()), 60_000)
    return () => clearInterval(id)
  }, [])
  const displayName = useMemo(() => getDoctorDisplayName(user), [user])
  const greetingTitle = useMemo(() => {
    if (!initialized) return null
    if (!displayName) return `${greeting}`
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
      </div>
    )
  }

  if (isError) {
    return (
      <ErrorState
        title="Unable to load your dashboard"
        message="We couldn't retrieve your clinical overview. Please try again."
        onRetry={refetch}
      />
    )
  }

  const stats = [
    { label: 'My Patients', value: data?.totalPatients || 0, icon: Users, color: 'bg-primary-50 text-primary-700 dark:bg-primary-50/20 dark:text-primary-300', tint: 'blue', accent: 'blue' },
    { label: 'Prescriptions', value: data?.totalPrescriptions || 0, icon: FileText, color: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-50/20 dark:text-cyan-300', tint: 'teal', accent: 'teal' },
    {
      label: 'Pending Reviews',
      value: data?.pendingReviews || 0,
      icon: AlertTriangle,
      color: 'bg-warning-light text-warning dark:bg-warning/20 dark:text-warning',
      highlight: (data?.pendingReviews || 0) > 0,
      tint: 'amber',
      accent: 'amber',
    },
    { label: 'Upcoming Follow-ups', value: data?.upcomingFollowUps || 0, icon: CalendarClock, color: 'bg-secondary-50 text-secondary-700 dark:bg-secondary-50/20 dark:text-secondary-300', tint: 'amber', accent: 'amber' },
  ]

  const quickActions = [
    { label: 'Upload Prescription', desc: 'Process a new prescription', icon: Upload, to: '/doctor/prescriptions/upload', color: 'bg-primary-50 text-primary-700 dark:bg-primary-50/20 dark:text-primary-300', feature: 'feature-card-blue' },
    { label: 'Search Patient', desc: 'Find a patient record', icon: Search, to: '/doctor/search', color: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-50/20 dark:text-cyan-300', feature: 'feature-card-cyan' },
    { label: 'AI Assistant', desc: 'Ask about patient records', icon: MessageSquareText, to: '/doctor/ai-assistant', color: 'bg-secondary-50 text-secondary-700 dark:bg-secondary-50/20 dark:text-secondary-300', feature: 'feature-card-teal' },
  ]

  return (
    <div>
      <motion.div initial={fadeUp.initial} animate={fadeUp.animate} transition={fadeUp.animate.transition} className="will-change-transform">
        {greetingTitle === null ? (
          <Skeleton className="h-9 w-72 mb-2" />
        ) : (
          <PageHeader
            eyebrow="Care Dashboard"
            accent="teal"
            title={greetingTitle}
            description="Here's your clinical workflow at a glance."
          />
        )}
      </motion.div>

      <motion.div variants={staggerContainer(0.04)} initial="initial" animate="animate" className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {quickActions.map((action) => (
          <motion.div key={action.label} variants={staggerItem} className="will-change-transform">
            <button
              onClick={() => navigate(action.to)}
              className={`group text-left rounded-xl border p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover w-full ${action.feature}`}
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${action.color}`}>
                <action.icon className="h-5 w-5" />
              </div>
              <p className="font-semibold text-foreground text-sm">{action.label}</p>
              <p className="text-xs text-foreground-muted mt-0.5">{action.desc}</p>
            </button>
          </motion.div>
        ))}
      </motion.div>

      <motion.div variants={staggerContainer(0.04)} initial="initial" animate="animate" className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <motion.div key={stat.label} variants={staggerItem} className="will-change-transform">
            <StatCard
              label={stat.label}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
              tint={stat.tint}
              accent={stat.accent}
              highlight={stat.highlight}
            />
          </motion.div>
        ))}
      </motion.div>

      <motion.div variants={staggerContainer(0.03)} initial="initial" animate="animate" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={staggerItem} className="lg:col-span-2 will-change-transform">
          <motion.div initial={fadeScale.initial} animate={fadeScale.animate} transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }} className="will-change-transform">
            <SectionCard
              title="Prescription Processing"
              description="Today's processing volume and review queue"
              icon={ClipboardList}
              action={
                (data?.pendingReviews || 0) > 0 ? (
                  <Link to="/doctor/search" className="text-xs font-medium text-cyan-600 hover:text-cyan-700">Review pending</Link>
                ) : null
              }
            >
              {data ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="feature-card-blue rounded-xl p-5">
                    <p className="text-2xl font-bold text-foreground counter-value">{data.todayPrescriptions || 0}</p>
                    <p className="text-xs font-medium text-foreground-muted mt-1">Processed Today</p>
                  </div>
                  <div className="feature-card-teal rounded-xl p-5">
                    <p className="text-2xl font-bold text-warning dark:text-warning counter-value">{data.pendingReviews || 0}</p>
                    <p className="text-xs font-medium text-foreground-muted mt-1">Awaiting Review</p>
                  </div>
                  <div className="feature-card-cyan rounded-xl p-5">
                    <p className="text-2xl font-bold text-secondary-700 dark:text-secondary-400 counter-value">{data.totalPrescriptions || 0}</p>
                    <p className="text-xs font-medium text-foreground-muted mt-1">Total Records</p>
                  </div>
                </div>
              ) : (
                <EmptyState title="No processing data" description="Upload a prescription to begin." />
              )}
            </SectionCard>
          </motion.div>
        </motion.div>

        <motion.div variants={staggerItem} className="lg:col-span-1 will-change-transform">
          <motion.div initial={fadeScale.initial} animate={fadeScale.animate} transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1], delay: 0.26 }} className="will-change-transform">
            <SectionCard
              title="Upcoming Follow-ups"
              description="Patient appointments scheduled"
              icon={CalendarClock}
              action={<Link to="/doctor/follow-ups" className="text-xs font-medium text-cyan-600 hover:text-cyan-700">View all <ArrowRight className="h-3 w-3 inline" /></Link>}
            >
              {data?.upcomingFollowUps > 0 ? (
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-secondary-50 to-cyan-50 dark:from-secondary-50/20 dark:to-cyan-50/20 text-secondary-700 dark:text-secondary-300 flex items-center justify-center ring-1 ring-secondary-200 dark:ring-secondary-800">
                    <CalendarClock className="h-7 w-7" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{data.upcomingFollowUps}</p>
                    <p className="text-sm text-foreground-muted">scheduled follow-ups</p>
                  </div>
                </div>
              ) : (
                <EmptyState title="No upcoming follow-ups" description="Scheduled follow-ups will appear here." className="py-8" />
              )}
            </SectionCard>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}
