import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from "motion"
import { followUpApi } from '../../services'
import { fadeUp, fadeScale, staggerContainer, staggerItem, listItem } from '@/motion/variants'
import { PageHeader, EmptyState, ErrorState, DateDisplay, StatusBadge } from '@/components/common'
import { Skeleton } from '@/components/ui'
import { CalendarClock } from 'lucide-react'

export default function PatientMyFollowUps() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['patient-followups'],
    queryFn: () => followUpApi.list({}).then((r) => r.data.data),
  })

  if (isLoading) {
    return (
    <div><Skeleton className="will-change-transform h-9 w-56 mb-2" />
        <Skeleton className="h-4 w-72 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      </div>
    )
  }

  if (isError) return <ErrorState title="Unable to load your follow-ups" message="We couldn't retrieve your follow-ups. Please try again." onRetry={refetch} />

  const followUps = data || []

  const sorted = [...followUps].sort((a, b) => new Date(a.date) - new Date(b.date))

  return (
    <motion.div initial={fadeUp.initial} animate={fadeUp.animate} transition={fadeUp.animate.transition} className="max-w-4xl mx-auto will-change-transform">
      <PageHeader
        title="My Follow-ups"
        description="Your scheduled follow-up visits with the clinic."
      />

      {followUps.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title="No follow-ups scheduled"
          description="When your clinic schedules a follow-up visit, it will appear here."
        />
      ) : (
        <div className="space-y-3">
          {sorted.map((f) => (
            <div key={f._id} className="card-surface p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <div className="w-11 h-11 bg-secondary-50 text-secondary-700 rounded-xl flex items-center justify-center shrink-0">
                <CalendarClock className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground">{f.reason || 'Follow-up visit'}</p>
                <p className="text-sm text-foreground-muted mt-0.5">
                  <DateDisplay date={f.date} format="dd MMM yyyy, HH:mm" />
                </p>
              </div>
              <StatusBadge status={f.status} dot className="shrink-0" />
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
