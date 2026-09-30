import { useQuery } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { motion } from 'motion'
import { CheckCircle2, Edit3, FileText, Sparkles, AlertTriangle, Check, X } from 'lucide-react'
import { toast } from 'sonner'
import { usePrescription, useApprovePrescription } from '@/features/prescriptions'
import { ConfidenceBadge, PageHeader, SectionCard, EmptyState, ErrorState } from '@/components/common'
import { Skeleton } from '@/components/ui'
import { fadeUp, fadeScale, staggerContainer, staggerItem } from '@/motion/variants'
import { cn } from '@/utils/cn'

export default function PrescriptionReview() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [doctorNotes, setDoctorNotes] = useState('')
  const [corrections, setCorrections] = useState([])

  const { data, isLoading, isError, refetch } = usePrescription(id)
  const approveMutation = useApprovePrescription()

  if (isLoading) {
    return (
      <div>
        <Skeleton className="h-9 w-64 mb-2" />
        <Skeleton className="h-4 w-80 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    )
  }

  if (isError) {
    return <ErrorState title="Unable to load prescription" message="Please try again." onRetry={refetch} />
  }
  if (!data) return <EmptyState title="Prescription not found" />

  const handleApprove = () => {
    if (data?.processingStatus === 'APPROVED') {
      toast.info('Prescription already approved')
      navigate(`/doctor/prescriptions/${id}`)
      return
    }
    approveMutation.mutate(
      { id, data: { doctorNotes, important: false, corrections } },
      {
        onSuccess: (res) => {
          toast.success(res.data?.message || 'Prescription approved successfully')
          navigate(`/doctor/prescriptions/${id}`)
        },
        onError: (err) => {
          const details = err.response?.data?.error?.details?.map((d) => d.message).join(', ')
          toast.error(details || err.response?.data?.message || 'Approval failed')
        },
      }
    )
  }

  const handleReject = () => {
    navigate(`/doctor/prescriptions/${id}`)
  }

  const addCorrection = (medIndex, fields) => {
    const additions = fields.map((f) => ({
      field: `medicine.${medIndex}.${f.field}`,
      originalValue: f.originalValue,
      correctedValue: f.correctedValue,
      reason: `Doctor corrected ${f.field}`,
    }))
    setCorrections((prev) => [...prev, ...additions])
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <motion.div initial={fadeUp.initial} animate={fadeUp.animate} transition={fadeUp.animate.transition} className="will-change-transform">
        <PageHeader
          eyebrow="Verification"
          accent="teal"
          title="Review & Approve Prescription"
          description="Verify the AI-extracted information against the original prescription before approval."
          breadcrumbs={[
            { label: 'Prescriptions', href: '/doctor/search' },
            { label: 'Review' },
          ]}
          action={
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1], delay: 0.15 }} className="flex gap-2 will-change-transform">
              <button
                onClick={handleReject}
                className="px-4 py-2.5 border border-border rounded-lg text-foreground-secondary hover:bg-surface-muted text-sm font-medium inline-flex items-center gap-2"
              >
                <X className="h-4 w-4" /> Hold
              </button>
              <button
                onClick={handleApprove}
                disabled={approveMutation.isPending || data?.processingStatus === 'APPROVED'}
                title={data?.processingStatus === 'APPROVED' ? 'Already approved' : data?.processingStatus !== 'NEEDS_REVIEW' ? `Status: ${data?.processingStatus}` : undefined}
                className="px-4 py-2.5 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 text-sm font-medium inline-flex items-center gap-2 shadow-sm disabled:opacity-60"
              >
                <CheckCircle2 className="h-4 w-4" />
                {data?.processingStatus === 'APPROVED' ? 'Already Approved' : approveMutation.isPending ? 'Approving...' : 'Approve & Save'}
              </button>
            </motion.div>
          }
        />
      </motion.div>

      <motion.div initial={fadeUp.initial} animate={fadeUp.animate} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1], delay: 0.06 }} className="flex items-center gap-2 text-xs text-secondary-700 bg-secondary-50 border border-secondary-200 rounded-lg px-3 py-2 w-fit will-change-transform">
        <Sparkles className="h-3.5 w-3.5" />
        AI-generated extraction. Doctor verification required before approval.
      </motion.div>

      {data?.imageQuality && (
        <motion.div initial={fadeScale.initial} animate={fadeScale.animate} transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1], delay: 0.1 }} className="will-change-transform">
        <SectionCard title={`Image Quality: ${data.imageQuality.score}%`} icon={FileText} tint="cyan" iconBg="icon-box-cyan" iconColor="text-[var(--icon-cyan)]">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium text-foreground-secondary">Quality Score</span>
                <span className="text-sm font-semibold text-foreground">{data.imageQuality.score}%</span>
              </div>
              <div className="h-2 bg-surface-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${data.imageQuality.score}%` }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                  className={cn('h-full rounded-full', data.imageQuality.score >= 70 ? 'bg-success' : data.imageQuality.score >= 50 ? 'bg-warning' : 'bg-error')}
                  style={{ willChange: 'width' }}
                />
              </div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            {[
              { label: 'Resolution', ok: !data.imageQuality.issues?.some((x) => x.toLowerCase().includes('resolution')) },
              { label: 'Lighting', ok: !data.imageQuality.issues?.some((x) => x.toLowerCase().includes('lighting') || x.toLowerCase().includes('exposed')) },
              { label: 'Blur', ok: !data.imageQuality.issues?.some((x) => x.toLowerCase().includes('blur')) },
              { label: 'Cropping', ok: !data.imageQuality.issues?.some((x) => x.toLowerCase().includes('crop')) },
              { label: 'Rotation', ok: !data.imageQuality.issues?.some((x) => x.toLowerCase().includes('rotation')) },
              { label: 'Contrast', ok: !data.imageQuality.issues?.some((x) => x.toLowerCase().includes('contrast')) },
            ].map((c) => (
              <span key={c.label} className={cn('inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium', c.ok ? 'bg-success-surface text-success border-success/20' : 'bg-warning-surface text-warning border-warning/20')}>
                {c.ok ? <Check className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />} {c.ok ? '✓' : '⚠'} {c.label}
              </span>
            ))}
          </div>
          {data.imageQuality.score < 50 && (
            <div className="mt-3 flex items-start gap-2 text-xs bg-error-surface border border-error/20 rounded-lg px-3 py-2 text-error">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" /> Image quality is critically low. Please retake with better lighting and focus.
            </div>
          )}
          {data.imageQuality.issues?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {data.imageQuality.issues.map((i) => (
                <span key={i} className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-warning-light text-warning rounded-lg">
                  <AlertTriangle className="h-3 w-3" /> {i}
                </span>
              ))}
            </div>
          )}
          </SectionCard>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={fadeScale.initial} animate={fadeScale.animate} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1], delay: 0.12 }} className="will-change-transform lg:h-fit lg:sticky lg:top-20">
          <SectionCard title="Original Prescription" description="Source document — OCR" tint="cyan" icon={FileText} iconBg="icon-box-cyan" iconColor="text-[var(--icon-cyan)]" className="h-full">
            {data?.originalImage?.url ? (
              <motion.img initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1], delay: 0.18 }} src={data.originalImage.url} alt="Original prescription" className="w-full rounded-lg border border-border will-change-transform" />
            ) : (
              <EmptyState title="No image available" className="py-8" />
            )}
          </SectionCard>
        </motion.div>

        <motion.div initial={fadeScale.initial} animate={fadeScale.animate} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1], delay: 0.16 }} className="will-change-transform">
          <SectionCard title="AI Extracted Information" description="Verify each field below" icon={Sparkles} tint="purple" iconBg="icon-box-purple" iconColor="text-[var(--icon-purple)]">
            {data?.ai?.medicines?.length > 0 ? (
              <motion.div variants={staggerContainer(0.06)} initial="initial" animate="animate" className="space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">Medicines</span>
                </div>
                {data.ai.medicines.map((med, i) => (
                  <motion.div key={i} variants={staggerItem} className="will-change-transform">
                    <MedCorrectionRow med={med} index={i} onCorrect={addCorrection} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <EmptyState title="No medicines extracted" description="No medicines were identified from the image." className="py-8" />
            )}
          </SectionCard>
        </motion.div>
      </div>

      {data?.ai?.summary && (
        <motion.div initial={fadeUp.initial} animate={fadeUp.animate} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1], delay: 0.18 }} className="will-change-transform">
          <SectionCard title="AI Summary" icon={Sparkles} tint="purple" iconBg="icon-box-purple" iconColor="text-[var(--icon-purple)]">
            <p className="text-foreground-secondary leading-relaxed text-sm">{data.ai.summary}</p>
          </SectionCard>
        </motion.div>
      )}

      {data?.ai?.importantFindings?.length > 0 && (
        <motion.div initial={fadeUp.initial} animate={fadeUp.animate} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1], delay: 0.2 }} className="will-change-transform">
          <SectionCard title="Important Findings" icon={AlertTriangle} tint="purple" iconBg="icon-box-amber" iconColor="text-[var(--icon-amber)]">
            <motion.ul variants={staggerContainer(0.04)} initial="initial" animate="animate" className="space-y-2">
              {data.ai.importantFindings.map((f, i) => (
                <motion.li key={i} variants={staggerItem} className="flex items-start gap-2 text-sm text-foreground-secondary will-change-transform">
                  <AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
                  {f}
                </motion.li>
              ))}
            </motion.ul>
          </SectionCard>
        </motion.div>
      )}

      <motion.div initial={fadeUp.initial} animate={fadeUp.animate} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1], delay: 0.22 }} className="will-change-transform">
        <SectionCard title="Doctor's Notes" description="Add clinical observations (optional)" tint="green" icon={CheckCircle2} iconBg="icon-box-green" iconColor="text-[var(--icon-green)]">
          <textarea
            value={doctorNotes}
            onChange={(e) => setDoctorNotes(e.target.value)}
            placeholder="Add any notes or clinical observations for this prescription..."
            className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary-500 min-h-[100px] text-sm"
          />
        </SectionCard>
      </motion.div>

      <div className="lg:hidden h-20" aria-hidden="true" />

      {corrections.length > 0 && (
        <motion.div initial={fadeScale.initial} animate={fadeScale.animate} transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }} className="will-change-transform">
          <SectionCard title={`${corrections.length} Correction${corrections.length > 1 ? 's' : ''} Pending`} icon={Edit3} tint="green" iconBg="icon-box-green" iconColor="text-[var(--icon-green)]">
            <motion.div variants={staggerContainer(0.03)} initial="initial" animate="animate" className="space-y-2">
              {corrections.map((c, i) => (
                <motion.div key={i} variants={staggerItem} className="flex items-center gap-3 text-sm bg-warning-surface rounded-lg px-3 py-2 will-change-transform">
                  <span className="font-medium text-warning">{c.field.split('.')[1]}</span>
                  <span className="text-foreground-secondary">
                    {c.field.split('.').pop()}: <span className="line-through text-foreground-muted">{c.originalValue}</span>
                    {' → '}<span className="font-semibold text-foreground">{c.correctedValue}</span>
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </SectionCard>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1], delay: 0.28 }} className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-surface/95 backdrop-blur border-t border-border px-4 py-3 flex gap-3 safe-area-inset-bottom will-change-transform">
        <button onClick={handleReject} className="flex-1 py-3 border border-border rounded-xl text-sm font-semibold text-foreground-secondary">Hold</button>
        <button onClick={handleApprove} disabled={approveMutation.isPending || data?.processingStatus === 'APPROVED'} className="flex-[1.4] py-3 bg-secondary-600 text-white rounded-xl text-sm font-semibold shadow-sm disabled:opacity-60">{data?.processingStatus === 'APPROVED' ? 'Already Approved' : approveMutation.isPending ? 'Approving...' : 'Approve & Save'}</button>
      </motion.div>
    </div>
  )
}

function MedCorrectionRow({ med, index, onCorrect }) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(med.name || '')
  const [dosage, setDosage] = useState(med.dosage || '')
  const [frequency, setFrequency] = useState(med.frequency || '')
  const [duration, setDuration] = useState(med.duration || '')

  const save = () => {
    const fields = []
    if (name !== med.name) fields.push({ field: 'name', originalValue: med.name, correctedValue: name })
    if (dosage !== med.dosage) fields.push({ field: 'dosage', originalValue: med.dosage, correctedValue: dosage })
    if (frequency !== med.frequency) fields.push({ field: 'frequency', originalValue: med.frequency, correctedValue: frequency })
    if (duration !== med.duration) fields.push({ field: 'duration', originalValue: med.duration, correctedValue: duration })
    if (fields.length > 0) onCorrect(index, fields)
    setEditing(false)
    if (fields.length > 0) toast.info('Correction added')
  }

  return (
    <div className="p-3 bg-surface-muted rounded-xl">
      {!editing ? (
        <div className="flex items-start justify-between gap-3">
          <motion.div variants={staggerContainer(0.04)} initial="initial" animate="animate" className="min-w-0 flex-1">
            <motion.div variants={staggerItem} className="flex items-center gap-2 flex-wrap will-change-transform">
              <p className="font-semibold text-foreground text-sm">{med.name}</p>
              <ConfidenceBadgeAnimated value={med.confidence} />
            </motion.div>
            <motion.p variants={staggerItem} className="text-sm text-foreground-muted mt-1 will-change-transform">
              {[med.dosage, med.frequency, med.duration].filter(Boolean).join(' · ') || 'Details pending'}
            </motion.p>
            <motion.div variants={staggerContainer(0.04)} initial="initial" animate="animate" className="flex flex-wrap gap-1.5 mt-2">
              {med.dosage && <motion.span variants={staggerItem} className="text-xs bg-surface border border-border rounded-lg px-2 py-1 will-change-transform">Dosage: {med.dosage}</motion.span>}
              {med.frequency && <motion.span variants={staggerItem} className="text-xs bg-surface border border-border rounded-lg px-2 py-1 will-change-transform">Freq: {med.frequency}</motion.span>}
              {med.duration && <motion.span variants={staggerItem} className="text-xs bg-surface border border-border rounded-lg px-2 py-1 will-change-transform">Duration: {med.duration}</motion.span>}
            </motion.div>
          </motion.div>
          <button
            onClick={() => setEditing(true)}
            className="px-3 py-1.5 text-xs border border-border rounded-lg text-foreground-secondary hover:bg-surface inline-flex items-center gap-1.5 shrink-0"
          >
            <Edit3 className="h-3 w-3" /> Correct
          </button>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Medicine name" className="sm:col-span-2 px-3 py-2 text-sm border border-border rounded-lg" />
            <input value={dosage} onChange={(e) => setDosage(e.target.value)} placeholder="Dosage (e.g. 500 mg)" className="px-3 py-2 text-sm border border-border rounded-lg" />
            <input value={frequency} onChange={(e) => setFrequency(e.target.value)} placeholder="Frequency" className="px-3 py-2 text-sm border border-border rounded-lg" />
            <input value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="Duration" className="px-3 py-2 text-sm border border-border rounded-lg" />
          </div>
          <div className="flex gap-2">
            <button onClick={save} className="px-3 py-1.5 text-xs bg-primary-800 text-white rounded-lg dark:bg-primary dark:text-white inline-flex items-center gap-1.5">
              <Check className="h-3 w-3" /> Save Correction
            </button>
            <button onClick={() => setEditing(false)} className="px-3 py-1.5 text-xs border border-border rounded-lg text-foreground-secondary hover:bg-surface">
              Cancel
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}

function ConfidenceBadgeAnimated({ value }) {
  const getStyle = (conf) => {
    if (conf >= 80) return { bg: 'bg-success-surface text-success border-success/20 dark:bg-success-surface-dark dark:text-success-light dark:border-success/30', label: 'High', bar: 'bg-success' }
    if (conf >= 60) return { bg: 'bg-warning-surface text-warning border-warning/20', label: 'Medium', bar: 'bg-warning' }
    return { bg: 'bg-error-surface text-error border-error/20', label: 'Low', bar: 'bg-error' }
  }
  const style = getStyle(typeof value === 'number' ? value : 0)
  return (
    <div className="inline-flex items-center gap-2">
      <div className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-full border', style.bg)}>
        <span>{style.label}</span>
        <span className="font-semibold">{value}%</span>
      </div>
      <div className="hidden sm:block w-14 h-1.5 bg-border rounded-full overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, Math.max(0, value || 0))}%` }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.2 }} className={cn('h-full rounded-full will-change-transform', style.bar)} />
      </div>
    </div>
  )
}
