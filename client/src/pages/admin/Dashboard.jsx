import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion'
import { useAdminDashboard } from '@/features/analytics'
import { PageHeader, StatCard, ErrorState } from '@/components/common'
import { Skeleton } from '@/components/ui'
import { fadeUp, fadeScale, staggerContainer, staggerItem } from '@/motion/variants'
import {
  Stethoscope, Users, UserCog, FileText, AlertTriangle, ArrowRight, Sparkles, CalendarCheck,
} from 'lucide-react'
import useAuthStore from '@/store/authStore'
import { getTimeBasedGreeting, getDisplayName } from '@/utils/greeting'

export default function AdminDashboard() {
  const { user, initialized } = useAuthStore()
  const { data, isLoading, isError, refetch } = useAdminDashboard()
  const [greeting, setGreeting] = useState(() => getTimeBasedGreeting())
  useEffect(() => { const id = setInterval(() => setGreeting(getTimeBasedGreeting()), 60_000); return () => clearInterval(id) }, [])
  const displayName = useMemo(() => getDisplayName(user), [user])

  if (isLoading) {
    return (
      <div>
        <Skeleton className="h-9 w-56 mb-2" />
        <Skeleton className="h-4 w-96 mb-8" />
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <ErrorState
        title="Unable to load clinic overview"
        message="We couldn't retrieve clinic statistics. Please try again."
        onRetry={refetch}
      />
    )
  }

  const stats = [
    { label: 'Doctors', value: data?.doctors || 0, icon: Stethoscope, color: 'bg-primary-50 text-primary-700 dark:bg-primary-50/20 dark:text-primary-300', tint: 'blue', accent: 'blue', to: '/admin/doctors' },
    { label: 'Staff', value: data?.staff || 0, icon: UserCog, color: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-50/20 dark:text-cyan-300', tint: 'cyan', accent: 'cyan', to: '/admin/staff' },
    { label: 'Patients', value: data?.patients || 0, icon: Users, color: 'bg-secondary-50 text-secondary-700 dark:bg-secondary-50/20 dark:text-secondary-300', tint: 'blue', accent: 'blue', to: '/admin/patients' },
    { label: 'Prescriptions', value: data?.prescriptions || 0, icon: FileText, color: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-50/20 dark:text-cyan-300', tint: 'teal', accent: 'teal', to: '/admin/patients' },
    { label: 'Pending AI Reviews', value: data?.pendingAI || 0, icon: AlertTriangle, color: 'bg-warning-light text-warning dark:bg-warning/20 dark:text-warning', tint: 'amber', accent: 'amber', to: '/admin/patients' },
  ]

  return (
    <div>
      <motion.div initial={fadeUp.initial} animate={fadeUp.animate} transition={fadeUp.animate.transition} className="page-admin will-change-transform break-words">
        {!initialized ? <Skeleton className="h-9 w-72 mb-2" /> : (
        <PageHeader
          eyebrow="Clinical Overview"
          accent="blue"
          title={displayName ? `${greeting}, ${displayName}` : `${greeting} — Clinic Overview`}
          description="Monitor clinic operations, team performance, and AI processing activity."
          action={
            <Link to="/admin/analytics" className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-800 text-white text-sm font-medium rounded-lg hover:bg-primary-900 transition-colors shadow-sm">
              View Analytics <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
        )}
      </motion.div>

      <motion.div variants={staggerContainer(0.04)} initial="initial" animate="animate" className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <motion.div key={stat.label} variants={staggerItem} className="will-change-transform">
            <Link to={stat.to} className="block">
              <StatCard label={stat.label} value={stat.value} icon={stat.icon} color={stat.color} tint={stat.tint} accent={stat.accent} />
            </Link>
          </motion.div>
        ))}
      </motion.div>

      <motion.div variants={staggerContainer(0.03)} initial="initial" animate="animate" className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={staggerItem} initial="initial" animate="animate" transition={{ ...fadeScale.animate.transition, delay: 0.2 }} className="lg:col-span-2 will-change-transform">
          <motion.div initial={fadeScale.initial} animate={fadeScale.animate} transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }} className="card-surface p-6 will-change-transform">
            <div className="flex items-center gap-2.5 mb-4">
              <Sparkles className="h-4 w-4 text-secondary-600" />
              <h3 className="text-[15px] font-semibold text-foreground">AI Processing Health</h3>
            </div>
            <p className="text-sm text-foreground-muted mb-5">
              Prescriptions processed through the AI document intelligence pipeline.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="feature-card-blue rounded-xl p-5">
                <p className="text-2xl font-bold text-foreground counter-value">{data?.prescriptions || 0}</p>
                <p className="text-xs font-medium text-foreground-muted mt-1">Total Prescriptions</p>
              </div>
              <div className="feature-card-teal rounded-xl p-5">
                <p className="text-2xl font-bold text-secondary-700 dark:text-secondary-400 counter-value">{data?.pendingAI || 0}</p>
                <p className="text-xs font-medium text-foreground-muted mt-1">Awaiting Review</p>
              </div>
              <div className="feature-card-cyan rounded-xl p-5 col-span-2 sm:col-span-1">
                <p className="text-2xl font-bold text-cyan-700 dark:text-cyan-400 counter-value">{data?.todayFollowUps || 0}</p>
                <p className="text-xs font-medium text-foreground-muted mt-1">Today's Records</p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        <motion.div variants={staggerItem} className="will-change-transform">
          <motion.div initial={fadeScale.initial} animate={fadeScale.animate} transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1], delay: 0.26 }} className="card-surface p-6 will-change-transform">
            <div className="flex items-center gap-2.5 mb-4">
              {data?.pendingAI > 0
                ? <AlertTriangle className="h-4 w-4 text-warning" />
                : <CalendarCheck className="h-4 w-4 text-success" />}
              <h3 className="text-[15px] font-semibold text-foreground">Reviews Pending</h3>
            </div>
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${data?.pendingAI > 0 ? 'bg-warning-light text-warning' : 'bg-success-surface text-success'}`}>
                {data?.pendingAI > 0
                  ? <AlertTriangle className="h-7 w-7" />
                  : <CalendarCheck className="h-7 w-7" />}
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{data?.pendingAI || 0}</p>
                <p className="text-sm text-foreground-muted">
                  {data?.pendingAI > 0 ? 'awaiting doctor verification' : 'all reviews complete'}
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}
