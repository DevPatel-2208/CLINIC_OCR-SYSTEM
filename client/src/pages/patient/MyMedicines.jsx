import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from "motion"
import { medicineApi, patientApi } from '../../services'
import { fadeUp, fadeScale, staggerContainer, staggerItem, listItem } from '@/motion/variants'
import { PageHeader, EmptyState, ErrorState, DateDisplay } from '@/components/common'
import { Skeleton } from '@/components/ui'
import { Pill } from 'lucide-react'

export default function PatientMyMedicines() {
  const { data: me, isLoading: isLoadingProfile, isError: isProfileError, refetch: refetchProfile } = useQuery({
    queryKey: ['patient-me'],
    queryFn: () => patientApi.getMe().then((r) => r.data.data),
  })

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['patient-medicines', me?._id],
    queryFn: () => medicineApi.getPatientHistory(me._id).then((r) => r.data.data),
    enabled: !!me?._id,
  })

  if (isLoadingProfile || isLoading) {
    return (
    <div><Skeleton className="will-change-transform h-9 w-56 mb-2" />
        <Skeleton className="h-4 w-72 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      </div>
    )
  }

  if (isProfileError || isError) {
    return (
      <ErrorState
        title="Unable to load your medicines"
        message="We couldn't retrieve your medicines. Please try again."
        onRetry={() => {
          if (isProfileError) refetchProfile()
          else refetch()
        }}
      />
    )
  }

  const medicines = Array.isArray(data) ? data : []

  return (
    <motion.div initial={fadeUp.initial} animate={fadeUp.animate} transition={fadeUp.animate.transition} className="max-w-4xl mx-auto will-change-transform">
      <PageHeader
        title="My Medicines"
        description="Medicines prescribed to you by the clinic."
      />

      {medicines.length === 0 ? (
        <EmptyState
          icon={Pill}
          title="No medicines yet"
          description="Medicines prescribed by your doctor will appear here."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {medicines.map((m) => (
            <div key={m.name} className="card-surface p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-secondary-50 text-secondary-700 rounded-lg flex items-center justify-center shrink-0">
                    <Pill className="h-5 w-5" />
                  </div>
                  <p className="font-semibold text-foreground">{m.name}</p>
                </div>
                <span className="text-xs text-foreground-muted bg-surface border border-border rounded-lg px-2 py-1 shrink-0">
                  {m.totalPrescriptions || (m.history?.length || 0)} time{(m.totalPrescriptions || (m.history?.length || 0)) !== 1 ? 's' : ''}
                </span>
              </div>
              {m.lastRecorded && (
                <p className="text-xs text-foreground-muted mt-3">
                  Last prescribed: <DateDisplay date={m.lastRecorded} format="dd MMM yyyy" />
                </p>
              )}
              {m.history && m.history.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border-subtle">
                  <p className="text-xs font-medium text-foreground-muted mb-2">Dosage history</p>
                  <div className="flex flex-wrap gap-1.5">
                    {m.history.slice(0, 4).map((h, i) => (
                      <span key={i} className="text-xs bg-surface-muted border border-border rounded-lg px-2 py-1 text-foreground-secondary">
                        {h.dosage} {h.frequency} {h.duration}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
