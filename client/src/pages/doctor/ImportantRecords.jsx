import { usePrescriptions } from '@/features/prescriptions'
import { PageHeader, EmptyState, ErrorState, DateDisplay, StatusBadge } from '@/components/common'
import { Skeleton } from '@/components/ui'
import { Link } from 'react-router-dom'
import { Star, ChevronRight } from 'lucide-react'

export default function DoctorImportantRecords() {
  const { data, isLoading, isError, refetch } = usePrescriptions({})

  if (isLoading) {
    return (
      <div>
        <Skeleton className="h-9 w-64 mb-2" />
        <Skeleton className="h-4 w-72 mb-6" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      </div>
    )
  }

  if (isError) {
    return <ErrorState title="Unable to load important records" message="We couldn't retrieve important records. Please try again." onRetry={refetch} />
  }

  const important = (data || []).filter((p) => p.important) || []

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <PageHeader
        title="Important Records"
        description="Prescriptions flagged as clinically important for quick reference."
      />

      {important.length === 0 ? (
        <div className="card-surface">
          <EmptyState
            icon={Star}
            title="No important records"
            description="Prescriptions marked as important during review will be collected here."
            className="py-14"
          />
        </div>
      ) : (
        <div className="space-y-3">
          {important.map((p) => (
            <Link
              key={p._id}
              to={`/doctor/prescriptions/${p._id}`}
              className="block card-surface p-4 hover:shadow-card-hover transition-shadow"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 bg-warning-light text-warning rounded-full flex items-center justify-center shrink-0">
                    <Star className="h-5 w-5 fill-warning" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{p.patientId?.name || 'Unknown patient'}</p>
                    <p className="text-xs text-foreground-muted truncate">
                      {p.ai?.summary?.substring(0, 90) || 'No summary'} ·{' '}
                      <DateDisplay date={p.prescriptionDate} format="dd MMM yyyy" />
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <StatusBadge status={p.processingStatus} />
                  <ChevronRight className="h-4 w-4 text-foreground-muted" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
