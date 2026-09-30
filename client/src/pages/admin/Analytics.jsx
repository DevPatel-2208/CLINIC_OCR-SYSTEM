import { useAdminAnalytics } from '@/features/analytics'
import { motion, AnimatePresence } from "motion"
import { PageHeader, SectionCard, EmptyState, ErrorState, StatCard } from '@/components/common'
import { fadeUp, fadeScale, staggerContainer, staggerItem, listItem } from '@/motion/variants'
import { Skeleton, Progress } from '@/components/ui'
import { Users, FileText, Activity, ShieldCheck } from 'lucide-react'
import PatientGrowthChart from '@/components/charts/PatientGrowthChart'
import PrescriptionVolumeChart from '@/components/charts/PrescriptionVolumeChart'
import ProcessingStatsChart from '@/components/charts/ProcessingStatsChart'

const statusColors = {
  APPROVED: '#15803D',
  UPLOADED: '#475569',
  IMAGE_PROCESSING: '#0369A1',
  OCR_PROCESSING: '#0891B2',
  AI_PROCESSING: '#7C3AED',
  NEEDS_REVIEW: '#D97706',
  REJECTED: '#B91C1C',
  PROCESSING_FAILED: '#B91C1C',
  UPCOMING: '#0369A1',
  COMPLETED: '#15803D',
  MISSED: '#B91C1C',
  CANCELLED: '#475569',
}

const fallbackColor = '#475569'

function toMonthLabel(monthKey) {
  if (!monthKey) return monthKey
  const [year, month] = monthKey.split('-')
  if (!year || !month) return monthKey
  const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const idx = parseInt(month, 10) - 1
  const name = names[idx] || month
  return `${name} ${year}`
}

export default function AdminAnalytics() {
  const { data, isLoading, isError, refetch } = useAdminAnalytics()

  if (isLoading) {
    return (
    <div>
        <Skeleton className="h-9 w-56 mb-2" />
        <Skeleton className="h-4 w-96 mb-8" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <ErrorState
        title="Unable to load analytics"
        message="We couldn't retrieve clinic analytics. Please try again."
        onRetry={refetch}
      />
    )
  }

  const patientGrowth = (data?.patientGrowth || []).map((p) => ({
    month: toMonthLabel(p._id),
    count: p.count,
  }))

  const prescriptionVolume = (data?.prescriptionVolume || []).map((p) => ({
    month: toMonthLabel(p._id),
    count: p.count,
  }))

  const processingStats = (data?.processingStats || []).map((s) => ({
    name: s._id ? s._id.replace(/_/g, ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase()) : 'Unknown',
    value: s.count,
    color: statusColors[s._id] || fallbackColor,
  }))

  const ocr = data?.ocrStats || {}

  const confidenceCards = [
    { label: 'Average OCR Confidence', value: `${(ocr.avgOcrConfidence ?? 0).toFixed(1)}%`, icon: Activity, color: 'bg-secondary-50 text-secondary-700', tint: 'purple', accent: 'purple' },
    { label: 'Average AI Confidence', value: `${(ocr.avgAiConfidence ?? 0).toFixed(1)}%`, icon: ShieldCheck, color: 'bg-cyan-50 text-cyan-700', tint: 'teal', accent: 'teal' },
  ]

  return (
    <motion.div initial={fadeUp.initial} animate={fadeUp.animate} transition={fadeUp.animate.transition} className="will-change-transform">
      <PageHeader
        eyebrow="Clinic Insights"
        accent="purple"
        title="Analytics"
        description="Track patient registration, prescription volume, and AI processing performance over time."
      />

      {/* OCR confidence summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {confidenceCards.map((card) => (
          <StatCard key={card.label} label={card.label} value={card.value} icon={card.icon} color={card.color} tint={card.tint} accent={card.accent} />
        ))}
        <StatCard
          label="Documents Analyzed"
          value={ocr.total ?? 0}
          icon={FileText}
          color="bg-primary-50 text-primary-700"
          tint="blue"
          accent="blue"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <SectionCard title="Patient Growth" description="New patients registered per month" icon={Users}>
          {patientGrowth.length > 0 ? (
            <PatientGrowthChart data={patientGrowth} />
          ) : (
            <EmptyState title="No patient growth data" description="Monthly registration data will appear here." className="py-10" />
          )}
        </SectionCard>

        <SectionCard title="Prescription Volume" description="Prescriptions processed per month" icon={FileText}>
          {prescriptionVolume.length > 0 ? (
            <PrescriptionVolumeChart data={prescriptionVolume} />
          ) : (
            <EmptyState title="No prescription data" description="Monthly processing volume will appear here." className="py-10" />
          )}
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title="Processing Distribution" description="Breakdown of prescriptions by processing status" icon={Activity}>
          {processingStats.length > 0 ? (
            <ProcessingStatsChart data={processingStats} />
          ) : (
            <EmptyState title="No processing data" description="Status distribution will appear here." className="py-10" />
          )}
        </SectionCard>

        <SectionCard title="OCR & AI Confidence" description="Prescription extraction quality across the pipeline" icon={ShieldCheck}>
          <div className="space-y-6 py-2">
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-foreground-secondary">OCR Confidence</p>
                <p className="text-sm font-semibold text-foreground">{(ocr.avgOcrConfidence ?? 0).toFixed(1)}%</p>
              </div>
              <Progress value={ocr.avgOcrConfidence ?? 0} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-foreground-secondary">AI Extraction Confidence</p>
                <p className="text-sm font-semibold text-foreground">{(ocr.avgAiConfidence ?? 0).toFixed(1)}%</p>
              </div>
              <Progress value={ocr.avgAiConfidence ?? 0} />
            </div>
            <div className="pt-4 border-t border-border-subtle flex items-center justify-between">
              <p className="text-sm text-foreground-muted">Records Analyzed</p>
              <p className="text-sm font-semibold text-foreground">{ocr.total ?? 0}</p>
            </div>
          </div>
        </SectionCard>
      </div>
    </motion.div>
  )
}
