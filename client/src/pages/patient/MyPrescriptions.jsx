import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from "motion"
import { prescriptionApi } from '../../services'
import { fadeUp, fadeScale, staggerContainer, staggerItem, listItem } from '@/motion/variants'
import { PageHeader, EmptyState, ErrorState, StatusBadge, DateDisplay } from '@/components/common'
import { Skeleton } from '@/components/ui'
import { Link } from 'react-router-dom'
import { FileText, ChevronRight } from 'lucide-react'

export default function PatientMyPrescriptions() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['patient-prescriptions'],
    queryFn: () => prescriptionApi.list({}).then((r) => r.data.data),
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

  if (isError) return <ErrorState title="Unable to load your prescriptions" message="We couldn't retrieve your prescriptions. Please try again." onRetry={refetch} />

  const approved = data?.filter((p) => p.processingStatus === 'APPROVED') || []

  return (
    <motion.div initial={fadeUp.initial} animate={fadeUp.animate} transition={fadeUp.animate.transition} className="max-w-4xl mx-auto will-change-transform">
      <PageHeader
        title="My Prescriptions"
        description="Your approved prescriptions from the clinic."
      />

      {approved.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No prescriptions yet"
          description="Once your doctor approves a prescription, it will appear here."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {approved.map((p) => (
            <Link
              key={p._id}
              to={`/patient/prescriptions/${p._id}`}
              className="card-surface p-5 hover:shadow-card-hover transition-all group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="w-10 h-10 bg-primary-50 text-primary-700 rounded-lg flex items-center justify-center shrink-0">
                  <FileText className="h-5 w-5" />
                </div>
                <StatusBadge status={p.processingStatus} className="shrink-0" />
              </div>
              <p className="font-semibold text-foreground mt-4 line-clamp-2">{p.ai?.summary || 'Prescription'}</p>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border-subtle">
                <p className="text-xs text-foreground-muted">
                  {p.doctorId?.name ? `Dr. ${p.doctorId.name}` : 'Clinic'} · <DateDisplay date={p.prescriptionDate} format="dd MMM yyyy" />
                </p>
                <ChevronRight className="h-4 w-4 text-foreground-muted group-hover:text-foreground-muted transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </motion.div>
  )
}
