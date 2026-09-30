import { useParams, Link } from 'react-router-dom'
import { motion } from 'motion'
import { useTreatmentTimeline } from '@/features/timeline'
import { PageHeader, EmptyState, ErrorState, DateDisplay } from '@/components/common'
import { Skeleton } from '@/components/ui'
import { ArrowLeft, Pill, FileText, Calendar, Star } from 'lucide-react'
import { fadeUp, fadeScale, staggerContainer, staggerItem } from '@/motion/variants'
import { cn } from '@/utils/cn'

const typeConfig = {
  PRESCRIPTION: { bg: 'bg-primary-50 text-primary-700 border-primary-200', icon: FileText, label: 'Prescription' },
  MEDICINE: { bg: 'bg-secondary-50 text-secondary-700 border-secondary-200', icon: Pill, label: 'Medicine' },
  FOLLOW_UP: { bg: 'bg-info-surface text-info border-info/20', icon: Calendar, label: 'Follow-up' },
}

export default function DoctorTreatmentTimeline() {
  const { id } = useParams()
  const { data, isLoading, isError, refetch } = useTreatmentTimeline(id)

  if (isLoading) {
    return (
      <div>
        <Skeleton className="h-9 w-56 mb-2" />
        <Skeleton className="h-4 w-80 mb-6" />
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      </div>
    )
  }

  if (isError) {
    return <ErrorState title="Unable to load timeline" message="We couldn't retrieve the treatment timeline. Please try again." onRetry={refetch} />
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div initial={fadeUp.initial} animate={fadeUp.animate} transition={fadeUp.animate.transition} className="will-change-transform">
        <PageHeader
          title="Treatment Timeline"
          description="Chronological record of prescriptions, medicines, and follow-ups for this patient."
          breadcrumbs={[
            { label: 'Patients', href: '/doctor/patients' },
            { label: 'Timeline' },
          ]}
        />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1], delay: 0.08 }} className="flex items-center gap-2 will-change-transform">
        <Link to={`/doctor/patients/${id}`} className="inline-flex items-center gap-2 px-3.5 py-2 border border-border text-foreground-secondary text-sm font-medium rounded-lg hover:bg-surface-muted">
          <ArrowLeft className="h-4 w-4" /> Back to Patient
        </Link>
        {data && (
          <motion.span initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.25, delay: 0.14, ease: [0.16, 1, 0.3, 1] }} className="text-xs text-foreground-muted bg-surface-muted border border-border rounded-lg px-2.5 py-1.5 will-change-transform">
            {data.length} event{data.length !== 1 ? 's' : ''}
          </motion.span>
        )}
      </motion.div>

      {!data || data.length === 0 ? (
        <motion.div initial={fadeScale.initial} animate={fadeScale.animate} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} className="card-surface will-change-transform">
          <EmptyState
            icon={FileText}
            title="No timeline events"
            description="Approved prescriptions and scheduled follow-ups will appear here in chronological order."
            className="py-14"
          />
        </motion.div>
      ) : (
        <div className="relative">
          <motion.div initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.2 }} style={{ originY: 0 }} className="absolute left-[19px] top-2 bottom-2 w-px bg-border will-change-transform" aria-hidden="true" />
          <motion.div variants={staggerContainer(0.06)} initial="initial" animate="animate" className="space-y-4">
            {data.map((event, i) => {
              const config = typeConfig[event.type] || typeConfig.PRESCRIPTION
              const Icon = config.icon
              return (
                <motion.div key={i} variants={staggerItem} className="relative pl-14 will-change-transform">
                  <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1], delay: 0.1 + i * 0.04 }} className={cn('absolute left-0 top-0 w-10 h-10 rounded-xl border flex items-center justify-center will-change-transform', config.bg)}>
                    <Icon className="h-4 w-4" />
                  </motion.div>
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1], delay: 0.06 + i * 0.03 }} className="card-surface p-4 hover:shadow-card-hover transition-shadow will-change-transform">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={cn('text-[11px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border', config.bg)}>
                          {config.label}
                        </span>
                        {event.important && (
                          <motion.span initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1], delay: 0.2 }} className="inline-flex items-center gap-1 text-[11px] text-warning bg-warning-light rounded-full px-2 py-0.5 will-change-transform">
                            <Star className="h-3 w-3" /> Important
                          </motion.span>
                        )}
                      </div>
                      <span className="text-xs text-foreground-muted">
                        <DateDisplay date={event.date} format="dd MMM yyyy" />
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-foreground mt-2">{event.title || config.label}</h3>
                    {event.description && (
                      <p className="text-sm text-foreground-secondary mt-1 leading-relaxed">{event.description}</p>
                    )}
                    {event.prescriptionId && (
                      <Link to={`/doctor/prescriptions/${event.prescriptionId}`} className="inline-block mt-2 text-xs font-medium text-cyan-600 hover:text-cyan-700">
                        View prescription →
                      </Link>
                    )}
                  </motion.div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      )}
    </div>
  )
}
