import { useParams, Link } from 'react-router-dom'
import { usePrescription, usePrescriptionComparison } from '@/features/prescriptions'
import { PageHeader, SectionCard, EmptyState, ErrorState, DateDisplay, ConfidenceBadge, StatusBadge } from '@/components/common'
import { Skeleton } from '@/components/ui'
import { Star, FileText, Pill, Sparkles, Stethoscope, User, Calendar, Plus, Minus, Edit3, AlertTriangle } from 'lucide-react'
import { cn } from '@/utils/cn'

export default function PrescriptionDetails() {
  const { id } = useParams()
  const { data, isLoading, isError, refetch } = usePrescription(id)
  const { data: comparison } = usePrescriptionComparison(id)

  if (isLoading) {
    return (
      <div>
        <Skeleton className="h-9 w-64 mb-2" />
        <Skeleton className="h-4 w-80 mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
        <Skeleton className="h-64 rounded-xl mt-6" />
      </div>
    )
  }

  if (isError) return <ErrorState title="Unable to load prescription" message="Please try again." onRetry={refetch} />
  if (!data) return <EmptyState title="Prescription not found" />

  const medicines = data.ai?.medicines || []
  const comparisonSections = [
    { label: 'Added Medicines', list: comparison?.added || [], icon: Plus, styles: 'border-success/20 bg-success-surface/50 dark:bg-success-surface-dark/50', text: 'text-success dark:text-success-light', iconColor: 'text-success', show: comparison?.added?.length > 0 },
    { label: 'Removed Medicines', list: comparison?.removed || [], icon: Minus, styles: 'border-error/20 bg-error-surface/50', text: 'text-error', iconColor: 'text-error', show: comparison?.removed?.length > 0 },
    { label: 'Dosage Changed', list: comparison?.dosageChanged || [], icon: Edit3, styles: 'border-warning/20 bg-warning-surface/50', text: 'text-warning', iconColor: 'text-warning', show: comparison?.dosageChanged?.length > 0 },
  ]

  const overview = [
    { label: 'Patient', value: data.patientId?.name, sub: data.patientId?.phone, icon: User },
    { label: 'Doctor', value: data.doctorId?.name, sub: data.doctorId?.specialization, icon: Stethoscope },
    { label: 'Date', value: <DateDisplay date={data.prescriptionDate} format="dd MMM yyyy" />, icon: Calendar },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      <PageHeader
        eyebrow="Prescription"
        accent="teal"
        title="Prescription Record"
        description="Full clinical record for this prescription, including AI extraction and review status."
        breadcrumbs={[
          { label: 'Prescriptions', href: '/doctor/search' },
          { label: 'Details' },
        ]}
        action={
          <div className="flex gap-2">
            {data.important && (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-warning bg-warning-light rounded-lg">
                <Star className="h-4 w-4 fill-warning" /> Important
              </span>
            )}
            <Link to={`/doctor/prescriptions/${id}/review`} className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-800 text-white text-sm font-medium rounded-lg hover:bg-primary-900 transition-colors shadow-sm">
              Review & Approve
            </Link>
          </div>
        }
      />

      {/* AI badge */}
      <div className="flex items-center gap-2 text-xs text-secondary-700 bg-secondary-50 border border-secondary-200 rounded-lg px-3 py-2 w-fit">
        <Sparkles className="h-3.5 w-3.5" />
        AI-extracted record {data.processingStatus === 'APPROVED' ? '· Approved by doctor' : '· Pending doctor review'}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {overview.map((o, idx) => (
          <div key={o.label} className={idx===0 ? "card-surface surface-blue p-4" : idx===1 ? "card-surface surface-teal p-4" : "card-surface p-4"}>
            <div className="flex items-center gap-2 text-xs text-foreground-muted uppercase tracking-wide">
              <o.icon className="h-3.5 w-3.5" /> {o.label}
            </div>
            <p className="text-sm font-semibold text-foreground mt-2">{o.value || '—'}</p>
            {o.sub && <p className="text-xs text-foreground-muted mt-0.5">{o.sub}</p>}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <StatusBadge status={data.processingStatus} dot />
        {data.imageQuality?.score !== undefined && (
          <span className="inline-flex items-center gap-1.5 text-xs text-foreground-muted bg-surface-muted border border-border rounded-lg px-2.5 py-1">
            Image quality {data.imageQuality.score}%
          </span>
        )}
      </div>

      {/* Image + medicines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title="Original Prescription" description="Source document — OCR" icon={FileText} tint="cyan" iconBg="icon-box-cyan" iconColor="text-[var(--icon-cyan)]" className="lg:h-fit lg:sticky lg:top-20">
          {data.originalImage?.url ? (
            <img src={data.originalImage.url} alt="Original prescription" className="w-full rounded-lg border border-border" />
          ) : (
            <EmptyState title="No image available" description="The source document for this prescription is not available." className="py-10" />
          )}
        </SectionCard>

        <SectionCard title="Medicines" description={`${medicines.length} medication${medicines.length !== 1 ? 's' : ''} extracted`} icon={Pill} tint="teal" iconBg="icon-box-teal" iconColor="text-[var(--icon-teal)]">
          {medicines.length > 0 ? (
            <div className="space-y-2.5">
              {medicines.map((m, i) => (
                <div key={i} className="p-3 bg-surface-muted rounded-xl">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <p className="text-sm font-semibold text-foreground">{m.name}</p>
                    <ConfidenceBadge value={m.confidence} />
                  </div>
                  <p className="text-sm text-foreground-muted mt-1">
                    {[m.dosage, m.frequency, m.duration].filter(Boolean).join(' · ') || 'Details pending'}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No medicines extracted" description="No medicines were identified for this prescription." className="py-10" />
          )}
        </SectionCard>
      </div>

      {data.ai?.summary && (
        <SectionCard title="AI Summary" icon={Sparkles} tint="purple" iconBg="icon-box-purple" iconColor="text-[var(--icon-purple)]">
          <p className="text-foreground-secondary leading-relaxed text-sm">{data.ai.summary}</p>
        </SectionCard>
      )}

      {data.ai?.importantFindings?.length > 0 && (
        <SectionCard title="Important Findings" icon={AlertTriangle} tint="purple" iconBg="icon-box-amber" iconColor="text-[var(--icon-amber)]">
          <ul className="space-y-2">
            {data.ai.importantFindings.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground-secondary">
                <AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </SectionCard>
      )}

      {data.doctorNotes ? (
        <SectionCard title="Doctor's Notes" icon={Stethoscope} tint="green" iconBg="icon-box-green" iconColor="text-[var(--icon-green)]">
          <p className="text-foreground-secondary text-sm leading-relaxed">{data.doctorNotes}</p>
        </SectionCard>
      ) : null}

      {comparisonSections.some((s) => s.show) && (
        <SectionCard title="Changes from Previous Prescription" description="Compared against the prior prescription" icon={Edit3} tint="teal" iconBg="icon-box-teal" iconColor="text-[var(--icon-teal)]">
          <div className="grid grid-cols-1 gap-4">
            {comparisonSections.filter((s) => s.show).map((section) => (
              <div key={section.label} className={cn('rounded-xl border p-4', section.styles)}>
                <p className={cn('font-medium text-sm flex items-center gap-2', section.text)}>
                  <section.icon className={cn('h-4 w-4', section.iconColor)} /> {section.label}
                </p>
                <div className="mt-2 space-y-1">
                  {section.list.map((m, i) => (
                    <p key={i} className="text-sm text-foreground-secondary ml-6">
                      {m.name}
                      {m.previous && m.current && (
                        <span className="text-foreground-muted">: <span className="line-through">{m.previous}</span> → <span className="font-semibold">{m.current}</span></span>
                      )}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  )
}
