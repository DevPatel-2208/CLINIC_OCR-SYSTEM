import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion'
import { Loader2, AlertCircle, CheckCircle2, Clock, RefreshCw } from 'lucide-react'
import { prescriptionApi, ocrApi, aiApi } from '@/services'
import { PROCESSING_STATUS_CONFIG } from '@/constants'
import { fadeUp, fadeScale, staggerContainer, staggerItem, successCheck } from '@/motion/variants'
import { toast } from 'sonner'

export default function PrescriptionProcessing() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['prescription', id],
    queryFn: () => prescriptionApi.getById(id).then((r) => r.data.data),
    refetchInterval: (query) => {
      const status = query.state.data?.processingStatus
      if (['NEEDS_REVIEW', 'APPROVED', 'REJECTED', 'PROCESSING_FAILED'].includes(status)) return false
      return 3000
    },
    refetchOnWindowFocus: false,
  })

  const retryMutation = useMutation({
    mutationFn: async () => {
      await prescriptionApi.retry(id)
      await ocrApi.processImage(id)
      await aiApi.extract(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prescription', id] })
      toast.success('Retrying processing...')
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Retry failed'),
  })

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-foreground-muted">Loading prescription…</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <div className="w-16 h-16 rounded-2xl bg-error-surface border border-error/20 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="h-7 w-7 text-error" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">Unable to load prescription</h2>
        <p className="text-sm text-foreground-muted mt-1">Please try again or return to patients.</p>
        <Link to="/doctor/patients" className="mt-6 inline-flex px-5 py-2.5 rounded-xl border border-border bg-surface text-sm font-medium hover:bg-surface-muted">Back to Patients</Link>
      </div>
    )
  }

  const status = data?.processingStatus
  const cfg = PROCESSING_STATUS_CONFIG[status] || PROCESSING_STATUS_CONFIG.UPLOADED
  const isProcessing = ['UPLOADED', 'IMAGE_PROCESSING', 'OCR_PROCESSING', 'AI_PROCESSING'].includes(status)
  const isFailed = status === 'PROCESSING_FAILED'
  const isReady = status === 'NEEDS_REVIEW'

  const stages = [
    { key: 'UPLOADED', label: 'Image uploaded' },
    { key: 'IMAGE_PROCESSING', label: 'Quality analysis & preprocessing' },
    { key: 'OCR_PROCESSING', label: 'OCR text extraction' },
    { key: 'AI_PROCESSING', label: 'AI structured extraction' },
    { key: 'NEEDS_REVIEW', label: 'Ready for doctor review' },
  ]

  const stageOrder = ['UPLOADED', 'IMAGE_PROCESSING', 'OCR_PROCESSING', 'AI_PROCESSING', 'NEEDS_REVIEW']
  const currentStageIdx = stageOrder.indexOf(status)

  return (
    <motion.div initial={fadeUp.initial} animate={fadeUp.animate} transition={fadeUp.animate.transition} className="max-w-lg mx-auto text-center py-12 will-change-transform">
      <motion.div
        key={status}
        initial={fadeScale.initial}
        animate={fadeScale.animate}
        transition={fadeScale.animate.transition}
        className={`w-20 h-20 rounded-2xl border flex items-center justify-center mx-auto mb-6 will-change-transform ${isProcessing ? 'surface-cyan border-cyan/30' : isFailed ? 'bg-error-surface border-error/20' : 'bg-success-surface border-success/20'}`}>
        <AnimatePresence mode="wait">
          {isProcessing ? (
            <motion.div key="processing" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.2 }}>
              <Loader2 className="h-8 w-8 text-info animate-spin" />
            </motion.div>
          ) : isFailed ? (
            <motion.div key="failed" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <AlertCircle className="h-8 w-8 text-error" />
            </motion.div>
          ) : (
            <motion.div key="success" variants={successCheck} initial="initial" animate="animate" className="will-change-transform">
              <CheckCircle2 className="h-8 w-8 text-success" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.h2 layout className="text-xl font-semibold text-foreground">{cfg.label}</motion.h2>
      <motion.p layout className="text-foreground-muted mt-2">
        {isProcessing ? 'Prescription is being processed...' : isFailed ? 'Processing failed' : 'Prescription ready for review'}
      </motion.p>

      {data?.imageQuality?.score !== undefined && (
        <motion.div initial={fadeUp.initial} animate={fadeUp.animate} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} className="mt-6 p-4 card-surface surface-cyan text-left will-change-transform">
          <p className="text-sm font-medium text-foreground-secondary flex items-center gap-2">
            <span className="icon-box-cyan w-6 h-6 rounded-md flex items-center justify-center text-[10px]">OCR</span>
            Image Quality: <span className={`font-bold ${data.imageQuality.score >= 70 ? 'text-success' : data.imageQuality.score >= 40 ? 'text-warning' : 'text-error'}`}>{data.imageQuality.score}%</span>
          </p>
          {data.imageQuality.issues?.length > 0 && (
            <div className="mt-2 space-y-1">
              {data.imageQuality.issues.map((issue) => (
                <p key={issue} className="text-xs text-warning">⚠ {issue}</p>
              ))}
            </div>
          )}
        </motion.div>
      )}

      <motion.div initial={fadeScale.initial} animate={fadeScale.animate} transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1], delay: 0.1 }} className="mt-6 p-4 card-surface surface-cyan tinted-header-cyan text-left will-change-transform">
        <p className="text-sm font-medium text-foreground-secondary mb-3 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[var(--icon-cyan)]" /> Processing Stages — OCR</p>
        <motion.div variants={staggerContainer(0.04)} initial="initial" animate="animate" className="space-y-2">
          {stages.map((stage, i) => {
            const isDone = i <= currentStageIdx && !isFailed
            const isCurrent = stageOrder[i] === status
            return (
              <motion.div key={stage.key} variants={staggerItem} layout className="flex items-center gap-2 will-change-transform">
                <AnimatePresence mode="wait">
                  {isDone ? (
                    <motion.div key="done" variants={successCheck} initial="initial" animate="animate" exit={{ opacity: 0, scale: 0.8 }} className="shrink-0 will-change-transform">
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    </motion.div>
                  ) : isCurrent && isFailed ? (
                    <motion.div key="failed-row" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="shrink-0 will-change-transform">
                      <AlertCircle className="h-4 w-4 text-error" />
                    </motion.div>
                  ) : isCurrent ? (
                    <motion.div key="current" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="shrink-0 will-change-transform">
                      <Loader2 className="h-4 w-4 text-info animate-spin" />
                    </motion.div>
                  ) : (
                    <motion.div key="pending" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="shrink-0 will-change-transform">
                      <Clock className="h-4 w-4 text-foreground-muted" />
                    </motion.div>
                  )}
                </AnimatePresence>
                <span className={`text-sm ${isDone ? 'text-foreground-secondary' : isCurrent ? 'text-foreground font-medium' : 'text-foreground-muted'}`}>
                  {stage.label}
                </span>
              </motion.div>
            )
          })}
        </motion.div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: 0.2 }} className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
        {isReady && (
          <Link
            to={`/doctor/prescriptions/${id}/review`}
            className="px-6 py-2.5 bg-primary text-white rounded-xl hover:opacity-90 text-sm font-medium inline-flex items-center justify-center gap-2 transition-colors"
          >
            Review Prescription
          </Link>
        )}
        {isFailed && (
          <button
            onClick={() => retryMutation.mutate()}
            disabled={retryMutation.isPending}
            aria-busy={retryMutation.isPending || undefined}
            className="px-6 py-2.5 bg-error text-white rounded-xl hover:bg-error-dark disabled:opacity-50 text-sm font-medium inline-flex items-center justify-center gap-2 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${retryMutation.isPending ? 'animate-spin' : ''}`} />
            Retry Processing
          </button>
        )}
        {status === 'APPROVED' && (
          <Link to={`/doctor/prescriptions/${id}`} className="px-6 py-2.5 bg-success text-white rounded-xl hover:bg-success-dark text-sm font-medium inline-flex items-center justify-center gap-2">
            <CheckCircle2 className="h-4 w-4" /> View Record
          </Link>
        )}
        {status === 'REJECTED' && (
          <span className="px-6 py-2.5 rounded-xl border border-error/20 bg-error-surface text-error text-sm font-medium inline-flex items-center gap-2">
            <AlertCircle className="h-4 w-4" /> Rejected
          </span>
        )}
        <Link
          to="/doctor/patients"
          className="px-6 py-2.5 border border-border bg-surface text-foreground-secondary rounded-xl hover:bg-surface-muted text-sm font-medium"
        >
          Back to Patients
        </Link>
      </motion.div>
    </motion.div>
  )
}
