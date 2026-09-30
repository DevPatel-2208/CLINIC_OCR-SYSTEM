import { useParams, Link } from 'react-router-dom'
import { useMedicineHistory } from '@/features/medicines'
import { PageHeader, EmptyState, ErrorState, DateDisplay } from '@/components/common'
import { Skeleton } from '@/components/ui'
import { ArrowLeft, Pill } from 'lucide-react'

export default function DoctorMedicineHistory() {
  const { id } = useParams()
  const { data, isLoading, isError, refetch } = useMedicineHistory(id)

  if (isLoading) {
    return (
      <div>
        <Skeleton className="h-9 w-56 mb-2" />
        <Skeleton className="h-4 w-80 mb-6" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      </div>
    )
  }

  if (isError) {
    return <ErrorState title="Unable to load medicine history" message="We couldn't retrieve the medicine history. Please try again." onRetry={refetch} />
  }

  const medicines = data && typeof data === 'object' && !Array.isArray(data) ? Object.entries(data) : []

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <PageHeader
        title="Medicine History"
        description="Complete medication history for this patient across all approved prescriptions."
        breadcrumbs={[
          { label: 'Patients', href: '/doctor/patients' },
          { label: 'Medicine History' },
        ]}
      />

      <div className="flex items-center gap-2">
        <Link to={`/doctor/patients/${id}`} className="inline-flex items-center gap-2 px-3.5 py-2 border border-border text-foreground-secondary text-sm font-medium rounded-lg hover:bg-surface-muted">
          <ArrowLeft className="h-4 w-4" /> Back to Patient
        </Link>
        {medicines.length > 0 && (
          <span className="text-xs text-foreground-muted bg-surface-muted border border-border rounded-lg px-2.5 py-1.5">
            {medicines.length} medication{medicines.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {medicines.length === 0 ? (
        <div className="card-surface">
          <EmptyState
            icon={Pill}
            title="No medicine history"
            description="Medicines prescribed across approved prescriptions will be listed here."
            className="py-14"
          />
        </div>
      ) : (
        <div className="space-y-4">
          {medicines.map(([name, entries]) => (
            <div key={name} className="card-surface overflow-hidden">
              <div className="px-5 py-4 border-b border-border-subtle flex items-center gap-3">
                <div className="w-9 h-9 bg-secondary-50 text-secondary-700 rounded-lg flex items-center justify-center shrink-0">
                  <Pill className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[15px] font-semibold text-foreground truncate">{name}</h3>
                  {entries[0]?.date && (
                    <p className="text-xs text-foreground-muted">
                      First recorded <DateDisplay date={entries[0].date} format="dd MMM yyyy" />
                    </p>
                  )}
                </div>
                <span className="text-xs text-foreground-muted bg-surface-muted border border-border rounded-lg px-2 py-1 shrink-0">
                  {entries.length} record{entries.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Desktop table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-foreground-muted uppercase tracking-wide">
                      <th className="px-5 py-2.5 font-medium">Date</th>
                      <th className="px-5 py-2.5 font-medium">Dosage</th>
                      <th className="px-5 py-2.5 font-medium">Frequency</th>
                      <th className="px-5 py-2.5 font-medium">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((entry, i) => (
                      <tr key={i} className="border-t border-border-subtle">
                        <td className="px-5 py-3 text-foreground-secondary"><DateDisplay date={entry.date} format="dd MMM yyyy" /></td>
                        <td className="px-5 py-3 text-foreground-secondary">{entry.dosage || '—'}</td>
                        <td className="px-5 py-3 text-foreground-secondary">{entry.frequency || '—'}</td>
                        <td className="px-5 py-3 text-foreground-secondary">{entry.duration || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="sm:hidden divide-y divide-border-subtle">
                {entries.map((entry, i) => (
                  <div key={i} className="px-5 py-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-foreground-muted"><DateDisplay date={entry.date} format="dd MMM yyyy" /></span>
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {[entry.dosage, entry.frequency, entry.duration].filter(Boolean).map((v, j) => (
                        <span key={j} className="text-xs bg-surface-muted border border-border rounded-lg px-2 py-1 text-foreground-secondary">{v}</span>
                      ))}
                      {[entry.dosage, entry.frequency, entry.duration].filter(Boolean).length === 0 && (
                        <span className="text-xs text-foreground-muted">No dosage details</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
