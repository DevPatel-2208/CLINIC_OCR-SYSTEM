import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from "motion"
import { useParams, Link } from 'react-router-dom'
import { fadeUp, fadeScale, staggerContainer, staggerItem, listItem } from '@/motion/variants'
import { prescriptionApi } from '../../services'
import { PageHeader, EmptyState, ErrorState, DateDisplay, StatusBadge } from '@/components/common'
import { Skeleton } from '@/components/ui'
import { ArrowLeft, Pill, Stethoscope, FileText, CalendarClock } from 'lucide-react'

export default function PatientPrescriptionDetails() {
  const { id } = useParams()
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['patient-prescription', id],
    queryFn: () => prescriptionApi.getById(id).then((r) => r.data.data),
  })

  if (isLoading) {
    return (
    <div><Skeleton className="will-change-transform h-9 w-40 mb-6" />
        <Skeleton className="h-32 rounded-xl mb-6" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  if (isError) return <ErrorState title="Unable to load prescription" message="We couldn't retrieve this prescription. Please try again." onRetry={refetch} />
  if (!data) return <EmptyState title="Prescription not found" />

  const medicines = Array.isArray(data.ai?.medicines) ? data.ai.medicines : []
  const summary = data.ai?.summary || data.medicinesSummary || 'Prescription Summary'

  return (
    <motion.div initial={fadeUp.initial} animate={fadeUp.animate} transition={fadeUp.animate.transition} className="max-w-3xl mx-auto will-change-transform">
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <Link to="/patient/prescriptions" className="p-2 text-foreground-muted hover:bg-surface-muted rounded-lg">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <PageHeader title="Prescription" description="Details of your prescription" breadcrumbs={[{ label: 'My Prescriptions', href: '/patient/prescriptions' }, { label: 'Details' }]} />
      </div>

      {/* Header info */}
      <div className="card-surface p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-primary-50 text-primary-700 rounded-xl flex items-center justify-center">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-foreground text-lg">{summary}</p>
              <p className="text-xs text-foreground-muted mt-0.5 flex items-center gap-1">
                <CalendarClock className="h-3 w-3" /> <DateDisplay date={data.prescriptionDate} format="dd MMM yyyy" />
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {data.doctorId?.name && (
              <span className="inline-flex items-center gap-1.5 text-xs text-foreground-secondary bg-surface-muted border border-border rounded-lg px-2.5 py-1">
                <Stethoscope className="h-3 w-3 text-secondary-600" /> Dr. {data.doctorId.name}
              </span>
            )}
            <StatusBadge status={data.processingStatus} />
          </div>
        </div>
      </div>

      {medicines.length > 0 && (
        <div className="card-surface p-6 mb-6">
          <div className="flex items-center gap-2.5 mb-4">
            <Pill className="h-4 w-4 text-secondary-600" />
            <h3 className="text-[15px] font-semibold text-foreground">Medicines</h3>
          </div>
          <div className="space-y-3">
            {medicines.map((m, i) => (
              <div key={i} className="p-4 bg-surface-muted rounded-xl">
                <p className="font-semibold text-foreground text-sm">{m.name}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-xs text-foreground-muted">
                  {m.dosage && <span>Dosage: {m.dosage}</span>}
                  {m.frequency && <span>Frequency: {m.frequency}</span>}
                  {m.duration && <span>Duration: {m.duration}</span>}
                  {m.instructions && <span className="w-full text-foreground-secondary mt-0.5">{m.instructions}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.doctorNotes && (
        <div className="card-surface p-6">
          <div className="flex items-center gap-2.5 mb-3">
            <Stethoscope className="h-4 w-4 text-secondary-600" />
            <h3 className="text-[15px] font-semibold text-foreground">Doctor's Notes</h3>
          </div>
          <p className="text-sm text-foreground-secondary whitespace-pre-line">{data.doctorNotes}</p>
        </div>
      )}

      {medicines.length === 0 && !data.doctorNotes && !data.ai?.summary && (
        <EmptyState title="Prescription details unavailable" description="Full prescription details are being prepared by your clinic." />
      )}
    </motion.div>
  )
}
