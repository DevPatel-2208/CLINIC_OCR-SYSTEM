import { useQuery, useMutation } from '@tanstack/react-query'
import { motion, AnimatePresence } from "motion"
import { toast } from 'sonner'
import { fadeUp, fadeScale, staggerContainer, staggerItem, listItem } from '@/motion/variants'
import { prescriptionApi, reportApi } from '../../services'
import { PageHeader, EmptyState, ErrorState, DateDisplay } from '@/components/common'
import { Skeleton } from '@/components/ui'
import { FileDown, FileText, Loader2 } from 'lucide-react'

function downloadBlob(data, name) {
  const url = window.URL.createObjectURL(new Blob([data]))
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  window.URL.revokeObjectURL(url)
}

export default function PatientMyReports() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['patient-reports-prescriptions'],
    queryFn: () => prescriptionApi.list({}).then((r) => r.data.data),
  })

  const downloadMutation = useMutation({
    mutationFn: (id) => reportApi.generatePrescriptionReport(id),
    onSuccess: (res, id) => {
      downloadBlob(res.data, `prescription-report-${id}.pdf`)
      toast.success('Report downloaded')
    },
    onError: () => toast.error('Could not generate report'),
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

  if (isError) return <ErrorState title="Unable to load your reports" message="We couldn't retrieve your reports. Please try again." onRetry={refetch} />

  const approved = data?.filter((p) => p.processingStatus === 'APPROVED') || []

  return (
    <motion.div initial={fadeUp.initial} animate={fadeUp.animate} transition={fadeUp.animate.transition} className="max-w-4xl mx-auto will-change-transform">
      <PageHeader
        title="My Reports"
        description="Download PDF reports for your approved prescriptions."
      />

      {approved.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No reports available"
          description="Once your prescription is approved, you'll be able to download its report here."
        />
      ) : (
        <div className="space-y-3">
          {approved.map((p) => (
            <div key={p._id} className="card-surface p-5 flex items-center gap-4">
              <div className="w-11 h-11 bg-primary-50 text-primary-700 rounded-xl flex items-center justify-center shrink-0">
                <FileText className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate">{p.ai?.summary || 'Prescription'}</p>
                <p className="text-xs text-foreground-muted mt-0.5">
                  <DateDisplay date={p.prescriptionDate} format="dd MMM yyyy" /> · Dr. {p.doctorId?.name || 'Clinic'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => downloadMutation.mutate(p._id)}
                disabled={downloadMutation.isPending && downloadMutation.variables === p._id}
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-primary-800 text-white text-sm font-medium rounded-lg hover:bg-primary-900 transition-colors shadow-sm disabled:opacity-50 shrink-0"
              >
                {downloadMutation.isPending && downloadMutation.variables === p._id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileDown className="h-4 w-4" />
                )}
                Download
              </button>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
