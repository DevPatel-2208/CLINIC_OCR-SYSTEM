import { useState, useEffect, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/features/auth'
import { prescriptionApi, patientApi } from '../../services'
import { getTimeBasedGreeting, getDisplayName } from '@/utils/greeting'
import { EmptyState, ErrorState, StatusBadge, DateDisplay, SectionCard } from '@/components/common'
import { Skeleton } from '@/components/ui'
import { Link } from 'react-router-dom'
import { motion } from 'motion'
import { fadeUp, fadeScale, staggerContainer, staggerItem } from '@/motion/variants'
import { FileText, Pill, CalendarClock, ArrowRight } from 'lucide-react'

export default function PatientDashboard() {
  const { user, initialized } = useAuth()
  const [greeting, setGreeting] = useState(() => getTimeBasedGreeting())
  useEffect(() => { const id = setInterval(() => setGreeting(getTimeBasedGreeting()), 60_000); return () => clearInterval(id) }, [])
  const displayName = useMemo(() => getDisplayName(user), [user])
  const greetingTitle = useMemo(() => {
    if (!initialized) return null
    if (!displayName) return greeting
    return `${greeting}, ${displayName}`
  }, [greeting, displayName, initialized])

  const { data: prescriptions, isLoading: loadPrescriptions, isError: errPrescriptions, refetch: refetchPrescriptions } = useQuery({
    queryKey: ['patient-my-prescriptions'],
    queryFn: () => prescriptionApi.list({}).then((r) => r.data.data),
  })

  const { data: me } = useQuery({
    queryKey: ['patient-me'],
    queryFn: () => patientApi.getMe().then((r) => r.data.data),
  })

  const { data: medicines, isLoading: loadMedicines } = useQuery({
    queryKey: ['patient-medicines', me?._id],
    queryFn: () => patientApi.getMedicines(me._id).then((r) => r.data.data),
    enabled: !!me?._id,
  })

  const { data: followUps, isLoading: loadFollowUps } = useQuery({
    queryKey: ['patient-followups', me?._id],
    queryFn: () => patientApi.getFollowUps(me._id).then((r) => r.data.data),
    enabled: !!me?._id,
  })

  if (loadPrescriptions) {
    return (
      <div>
        <Skeleton className="h-9 w-72 mb-2" />
        <Skeleton className="h-4 w-96 mb-8" />
        <Skeleton className="h-40 rounded-xl mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-56 rounded-xl" />
          <Skeleton className="h-56 rounded-xl" />
        </div>
      </div>
    )
  }

  if (errPrescriptions) {
    return <ErrorState title="Unable to load your dashboard" message="We couldn't retrieve your records. Please try again." onRetry={refetchPrescriptions} />
  }

  const approved = prescriptions?.filter((p) => p.processingStatus === 'APPROVED') || []
  const medicineNames = medicines && Object.keys(medicines).length ? Object.keys(medicines) : []
  const todayFollowUps = (followUps || []).filter((f) => f.status === 'UPCOMING')

  return (
    <div>
      <motion.div initial={fadeUp.initial} animate={fadeUp.animate} transition={fadeUp.animate.transition} className="card-surface p-6 mb-6 bg-gradient-to-br from-primary-800 to-primary-900 text-white border-primary-800 will-change-transform">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center text-xl font-bold shrink-0">
            {user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 break-words">
            {greetingTitle === null ? <Skeleton className="h-7 w-48 bg-white/20" /> : <h1 className="text-2xl font-bold tracking-tight break-words">{greetingTitle}</h1>}
            <p className="text-sm text-primary-100 mt-1">Your health and care records, all in one place.</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <motion.div initial={fadeScale.initial} animate={fadeScale.animate} transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }} className="lg:col-span-2 will-change-transform">
          <SectionCard
            title="Recent Prescriptions"
            description="Your latest approved prescriptions"
            icon={FileText}
            action={
              <Link to="/patient/prescriptions" className="text-xs font-medium text-cyan-600 hover:text-cyan-700">
                View all <ArrowRight className="h-3 w-3 inline" />
              </Link>
            }
          >
            {approved.length ? (
              <motion.div variants={staggerContainer(0.03)} initial="initial" animate="animate" className="space-y-2">
                {approved.slice(0, 3).map((p) => (
                  <motion.div key={p._id} variants={staggerItem} className="will-change-transform">
                    <Link
                      to={`/patient/prescriptions/${p._id}`}
                      className="flex items-center justify-between p-3 bg-surface-muted rounded-xl hover:bg-surface-muted transition-colors">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{p.ai?.summary || 'Prescription'}</p>
                        <p className="text-xs text-foreground-muted mt-0.5">
                          <DateDisplay date={p.prescriptionDate} format="dd MMM yyyy" /> · Dr. {p.doctorId?.name || 'Clinic'}
                        </p>
                      </div>
                      <StatusBadge status={p.processingStatus} className="ml-3 shrink-0" />
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <EmptyState title="No prescriptions yet" description="Approved prescriptions will appear here once available." className="py-8" />
            )}
          </SectionCard>
        </motion.div>

        <div className="space-y-6">
          <motion.div initial={fadeScale.initial} animate={fadeScale.animate} transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1], delay: 0.24 }} className="will-change-transform">
            <SectionCard title="Follow-ups" description="Your scheduled visits" icon={CalendarClock} action={<Link to="/patient/follow-ups" className="text-xs font-medium text-cyan-600 hover:text-cyan-700">View all</Link>} bodyClassName="p-4">
              {loadFollowUps ? (
                <Skeleton className="h-16 rounded-lg" />
              ) : todayFollowUps.length ? (
                <motion.div variants={staggerContainer(0.03)} initial="initial" animate="animate" className="space-y-2">
                  {todayFollowUps.slice(0, 3).map((f) => (
                    <motion.div key={f._id} variants={staggerItem} className="flex items-center gap-3 p-3 bg-surface-muted rounded-lg will-change-transform">
                      <div className="w-9 h-9 bg-secondary-50 text-secondary-700 rounded-lg flex items-center justify-center shrink-0">
                        <CalendarClock className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">{f.reason || 'Follow-up visit'}</p>
                        <p className="text-xs text-foreground-muted"><DateDisplay date={f.date} format="dd MMM yyyy HH:mm" /></p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <EmptyState title="No upcoming follow-ups" description="Your scheduled visits will appear here." className="py-6" />
              )}
            </SectionCard>
          </motion.div>

          <motion.div initial={fadeScale.initial} animate={fadeScale.animate} transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1], delay: 0.28 }} className="will-change-transform">
            <SectionCard title="Medicines" description="Your prescribed medicines" icon={Pill} action={<Link to="/patient/medicines" className="text-xs font-medium text-cyan-600 hover:text-cyan-700">View all</Link>} bodyClassName="p-4">
              {loadMedicines ? (
                <Skeleton className="h-16 rounded-lg" />
              ) : medicineNames.length ? (
                <motion.div variants={staggerContainer(0.03)} initial="initial" animate="animate" className="flex flex-wrap gap-2">
                  {medicineNames.slice(0, 6).map((name) => (
                    <motion.span key={name} variants={staggerItem} className="inline-flex items-center gap-1.5 text-xs bg-secondary-50 text-secondary-800 border border-secondary-200 rounded-lg px-2.5 py-1.5 will-change-transform">
                      <Pill className="h-3 w-3" /> {name}
                    </motion.span>
                  ))}
                </motion.div>
              ) : (
                <EmptyState title="No medicines yet" description="Prescribed medicines will appear here." className="py-6" />
              )}
            </SectionCard>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
