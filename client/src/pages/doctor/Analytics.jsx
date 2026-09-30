import { useAIEvaluation } from '@/features/analytics'
import { motion, AnimatePresence } from "motion"
import { PageHeader, StatCard, SectionCard, EmptyState, ErrorState, DateDisplay } from '@/components/common'
import { fadeUp, fadeScale, staggerContainer, staggerItem, listItem } from '@/motion/variants'
import { Skeleton } from '@/components/ui'
import { FileText, Activity, CheckCircle2, Sparkles, TrendingUp, Timer, Wrench } from 'lucide-react'
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, Cell, Legend,
} from 'recharts'

export default function DoctorAnalytics() {
  const { data, isLoading, isError, refetch } = useAIEvaluation()

  if (isLoading) {
    return (
    <div><Skeleton className="will-change-transform h-9 w-48 mb-2" />
        <Skeleton className="h-4 w-72 mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
        <Skeleton className="h-72 rounded-xl mt-6" />
      </div>
    )
  }

  if (isError) {
    return <ErrorState title="Unable to load analytics" message="We couldn't retrieve AI processing analytics. Please try again." onRetry={refetch} />
  }

  const stats = data?.stats || {}
  const logs = data?.logs || []
  const totalProcessed = stats.totalProcessed || 0
  const successRate = totalProcessed ? ((stats.successCount / totalProcessed) * 100) : 0

  const statCards = [
    { label: 'Total Processed', value: stats.totalProcessed || 0, icon: FileText, color: 'bg-primary-50 text-primary-700', tint: 'blue', accent: 'blue' },
    { label: 'Average OCR Confidence', value: `${(stats.avgOcrConfidence || 0).toFixed(1)}%`, icon: Activity, color: 'bg-cyan-50 text-cyan-700', tint: 'cyan', accent: 'cyan' },
    { label: 'Average AI Confidence', value: `${(stats.avgAiConfidence || 0).toFixed(1)}%`, icon: Sparkles, color: 'bg-secondary-50 text-secondary-700', tint: 'purple', accent: 'purple' },
    { label: 'Success Rate', value: `${successRate.toFixed(1)}%`, icon: CheckCircle2, color: 'bg-success-surface text-success', tint: 'green', accent: 'green' },
  ]

  const detailStats = [
    { label: 'Fields Extracted', value: stats.totalFieldsExtracted || 0, icon: Wrench, color: 'bg-cyan-50 text-cyan-700', tint: 'cyan', accent: 'cyan' },
    { label: 'Fields Corrected', value: stats.totalFieldsCorrected || 0, icon: TrendingUp, color: 'bg-amber-50 text-amber-700' },
    { label: 'Avg Processing Time', value: `${(stats.avgProcessingTime || 0).toFixed(0)} ms`, icon: Timer, color: 'bg-surface-muted text-foreground-secondary' },
  ]

  // Chart data: confidence trend over recent logs
  const confidenceData = [...logs].slice(0, 20).reverse().map((log, i) => ({
    name: `#${i + 1}`,
    OCR: Math.round((log.ocrConfidence || 0)),
    AI: Math.round((log.aiConfidence || 0)),
  }))

  // Success / failed breakdown
  const outcomeData = [
    { name: 'Success', value: stats.successCount || 0, color: 'var(--success)' },
    { name: 'Failed', value: stats.failedCount || 0, color: 'var(--error)' },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-6 will-change-transform">
      <PageHeader
        eyebrow="AI Performance"
        accent="teal"
        title="Analytics"
        description="AI document processing performance across the clinic."
      />

      {/* Main stat cards */}
      <motion.div variants={staggerContainer(0.04)} initial="initial" animate="animate" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} icon={s.icon} color={s.color} tint={s.tint} accent={s.accent} />
        ))}
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SectionCard title="Confidence Trend" description="OCR and AI confidence across recent records" icon={Activity} className="lg:col-span-2">
          {confidenceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={confidenceData} margin={{ top: 5, right: 20, bottom: 5, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--foreground-muted)' }} axisLine={false} tickLine={false} stroke="var(--border-color)" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: 'var(--foreground-muted)' }} axisLine={false} tickLine={false} stroke="var(--border-color)" />
                <Tooltip contentStyle={{ backgroundColor: 'var(--surface-elevated)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--foreground)', fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12, color: 'var(--foreground-muted)' }} />
                <Line type="monotone" dataKey="OCR" stroke="var(--primary)" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="AI" stroke="var(--secondary)" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title="No processing data" description="Confidence trends will appear as records are processed." className="py-10" />
          )}
        </SectionCard>

        <SectionCard title="Outcome Breakdown" description="Success vs failed processing" icon={CheckCircle2}>
          {logs.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={outcomeData} margin={{ top: 5, right: 20, bottom: 5, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--foreground-muted)' }} axisLine={false} tickLine={false} stroke="var(--border-color)" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--foreground-muted)' }} axisLine={false} tickLine={false} stroke="var(--border-color)" />
                <Tooltip contentStyle={{ backgroundColor: 'var(--surface-elevated)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--foreground)', fontSize: 12 }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {outcomeData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title="No outcome data" description="Processing outcomes will appear here." className="py-10" />
          )}
        </SectionCard>
      </div>

      {/* Detail stats */}
      <SectionCard title="Processing Details" description="AI pipeline performance metrics" icon={Sparkles}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {detailStats.map((s) => (
            <div key={s.label} className="bg-surface-muted rounded-xl p-5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
                <s.icon className="h-5 w-5" />
              </div>
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs font-medium text-foreground-muted mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Recent logs */}
      {logs.length > 0 && (
        <SectionCard title="Recent Processing Logs" description="Latest AI processing activity" icon={FileText}>
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-foreground-muted uppercase tracking-wide border-b border-border-subtle">
                  <th className="py-2.5 text-left font-medium">Status</th>
                  <th className="py-2.5 text-left font-medium">OCR Confidence</th>
                  <th className="py-2.5 text-left font-medium">AI Confidence</th>
                  <th className="py-2.5 text-left font-medium">Fields</th>
                  <th className="py-2.5 text-left font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {logs.slice(0, 12).map((log, i) => (
                  <tr key={i} className="border-b border-surface-muted last:border-0">
                    <td className="py-3">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${log.status === 'SUCCESS' ? 'bg-success-surface text-success' : log.status === 'FAILED' ? 'bg-error-surface text-error' : 'bg-surface-muted text-foreground-secondary'}`}>
                        {log.status || 'PROCESSING'}
                      </span>
                    </td>
                    <td className="py-3 text-foreground-secondary">{(log.ocrConfidence || 0).toFixed(0)}%</td>
                    <td className="py-3 text-foreground-secondary">{(log.aiConfidence || 0).toFixed(0)}%</td>
                    <td className="py-3 text-foreground-secondary">{log.fieldsExtracted || 0} / {log.fieldsCorrected || 0}</td>
                    <td className="py-3 text-foreground-muted"><DateDisplay date={log.createdAt} relative /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="sm:hidden space-y-3">
            {logs.slice(0, 12).map((log, i) => (
              <div key={i} className="p-3 bg-surface-muted rounded-xl">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${log.status === 'SUCCESS' ? 'bg-success-surface text-success' : log.status === 'FAILED' ? 'bg-error-surface text-error' : 'bg-surface-muted text-foreground-secondary'}`}>
                    {log.status || 'PROCESSING'}
                  </span>
                  <span className="text-xs text-foreground-muted"><DateDisplay date={log.createdAt} relative /></span>
                </div>
                <p className="text-xs text-foreground-muted mt-2">
                  OCR {(log.ocrConfidence || 0).toFixed(0)}% · AI {(log.aiConfidence || 0).toFixed(0)}% · {log.fieldsExtracted || 0} fields
                </p>
              </div>
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  )
}
