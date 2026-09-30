import { useState } from 'react'
import { motion, AnimatePresence } from "motion"
import { useMutation } from '@tanstack/react-query'
import { fadeUp, fadeScale, staggerContainer, staggerItem, listItem } from '@/motion/variants'
import { toast } from 'sonner'
import { useGenerateReport } from '@/features/reports'
import { usePrescriptions } from '@/features/prescriptions'
import { PageHeader, SectionCard, EmptyState, ErrorState, DateDisplay } from '@/components/common'
import { Skeleton, Button } from '@/components/ui'
import { Download, FileText, Sparkles } from 'lucide-react'

export default function DoctorReports() {
  const [prescriptionId, setPrescriptionId] = useState('')
  const generateReport = useGenerateReport()
  const { data, isLoading, isError, refetch } = usePrescriptions({})

  const handleGenerate = (pid) => {
    const id = pid || prescriptionId
    if (!id) return
    generateReport.mutate(id, {
      onSuccess: (res) => {
        const url = window.URL.createObjectURL(new Blob([res.data]))
        const a = document.createElement('a')
        a.href = url
        a.download = `prescription-${id}.pdf`
        a.click()
        window.URL.revokeObjectURL(url)
        toast.success('Report downloaded')
      },
      onError: () => toast.error('Failed to generate report'),
    })
  }

  const approved = (data || []).filter((p) => p.processingStatus === 'APPROVED')

  if (isLoading) {
    return (
      <div>
        <Skeleton className="h-9 w-40 mb-2" />
        <Skeleton className="h-4 w-72 mb-6" />
        <Skeleton className="h-48 rounded-xl mb-6" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  if (isError) {
    return <ErrorState title="Unable to load reports" message="We couldn't retrieve records for report generation. Please try again." onRetry={refetch} />
  }

  return (
    <motion.div initial={fadeUp.initial} animate={fadeUp.animate} transition={fadeUp.animate.transition} className="max-w-4xl mx-auto space-y-6 will-change-transform">
      <PageHeader
        eyebrow="Reports"
        accent="slate"
        title="Reports"
        description="Generate PDF clinical reports from approved prescriptions and export patient records."
      />

      {/* Manual generate */}
      <SectionCard title="Generate Report" description="Enter a prescription ID to generate and download a PDF report">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={prescriptionId}
            onChange={(e) => setPrescriptionId(e.target.value)}
            placeholder="Enter prescription ID"
            className="flex-1 px-3.5 py-2.5 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
          />
          <Button
            onClick={() => handleGenerate()}
            disabled={!prescriptionId || generateReport.isPending}
            loading={generateReport.isPending}
          >
            <Download className="h-4 w-4" /> Generate PDF
          </Button>
        </div>
      </SectionCard>

      {/* Approved prescriptions list */}
      <SectionCard title="Approved Prescriptions" description="Select a record to generate its PDF report" icon={FileText}>
        {approved.length === 0 ? (
          <EmptyState
            title="No approved prescriptions"
            description="Approved prescriptions will appear here, ready for report generation."
            className="py-10"
          />
        ) : (
          <div>
            {/* Desktop table */}
            <div className="hidden sm:block divide-y divide-border-subtle">
              {approved.map((p) => (
                <div key={p._id} className="flex items-center gap-4 px-1 py-3">
                  <div className="w-10 h-10 bg-primary-50 text-primary-700 rounded-full flex items-center justify-center shrink-0">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {p.patientId?.name || 'Unknown patient'}
                    </p>
                    <p className="text-xs text-foreground-muted truncate">
                      {p.ai?.summary?.substring(0, 80) || 'No summary'} ·{' '}
                      <DateDisplay date={p.prescriptionDate} format="dd MMM yyyy" />
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleGenerate(p._id)}
                    disabled={generateReport.isPending && generateReport.variables === p._id}
                    loading={generateReport.isPending && generateReport.variables === p._id}
                  >
                    <Download className="h-3.5 w-3.5" /> Report
                  </Button>
                </div>
              ))}
            </div>
            {/* Mobile cards */}
            <div className="sm:hidden space-y-3">
              {approved.map((p) => (
                <div key={p._id} className="card-surface p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-primary-50 text-primary-700 rounded-full flex items-center justify-center shrink-0">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">{p.patientId?.name || 'Unknown patient'}</p>
                      <p className="text-xs text-foreground-muted mt-0.5">
                        <DateDisplay date={p.prescriptionDate} format="dd MMM yyyy" />
                      </p>
                    </div>
                  </div>
                  {p.ai?.summary && (
                    <p className="text-xs text-foreground-secondary line-clamp-2">{p.ai.summary}</p>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => handleGenerate(p._id)}
                    disabled={generateReport.isPending && generateReport.variables === p._id}
                    loading={generateReport.isPending && generateReport.variables === p._id}
                  >
                    <Download className="h-3.5 w-3.5" /> Download Report
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </SectionCard>

      {/* AI note */}
      <div className="flex items-center gap-2 text-xs text-secondary-700 bg-secondary-50 border border-secondary-200 rounded-lg px-3 py-2 w-fit">
        <Sparkles className="h-3.5 w-3.5" />
        Reports are generated from approved prescriptions only, for clinical record-keeping.
      </div>
    </motion.div>
  )
}
