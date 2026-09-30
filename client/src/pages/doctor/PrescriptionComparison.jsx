import { usePrescriptionComparison } from '@/features/comparison'
import { PageHeader, EmptyState, ErrorState, DateDisplay } from '@/components/common'
import { Skeleton } from '@/components/ui'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'motion'
import { ArrowLeft, Plus, Minus, Edit3, FileText } from 'lucide-react'
import { fadeUp, fadeScale, staggerContainer, staggerItem } from '@/motion/variants'
import { cn } from '@/utils/cn'

export default function DoctorPrescriptionComparison() {
  const { id } = useParams()
  const { data, isLoading, isError, refetch } = usePrescriptionComparison(id)

  if (isLoading) {
    return (
      <div>
        <Skeleton className="h-9 w-64 mb-2" />
        <Skeleton className="h-4 w-80 mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
        </div>
        <Skeleton className="h-64 rounded-xl mt-6" />
      </div>
    )
  }

  if (isError) return <ErrorState title="Unable to load comparison" message="Please try again." onRetry={refetch} />
  if (!data || data.message) return <EmptyState title={data?.message || 'No comparison available'} description="A previous prescription is needed to compare changes." className="py-14" />

  const sections = [
    { key: 'added', label: 'Added Medicines', icon: Plus, tone: 'emerald', list: data.added || [], render: (m) => `${m.name}${m.dosage ? ` · ${m.dosage}` : ''}` },
    { key: 'removed', label: 'Removed Medicines', icon: Minus, tone: 'red', list: data.removed || [], render: (m) => m.name },
    { key: 'dosageChanged', label: 'Dosage Changes', icon: Edit3, tone: 'amber', list: data.dosageChanged || [], render: (m) => `${m.name}: ${m.previous} → ${m.current}` },
  ]

  const toneStyles = {
    emerald: { card: 'border-success/20 bg-success-surface/40 dark:bg-success-surface-dark/40', text: 'text-success dark:text-success-light', iconBg: 'bg-success-light text-success dark:bg-success-light/20 dark:text-success-light', item: 'text-success dark:text-success-light' },
    red: { card: 'border-error/20 bg-error-surface/40', text: 'text-error', iconBg: 'bg-error-light text-error dark:bg-error-light/20 dark:text-error-light', item: 'text-error' },
    amber: { card: 'border-warning/20 bg-warning-surface/40', text: 'text-warning', iconBg: 'bg-warning-light text-warning dark:bg-warning-light/20 dark:text-warning-light', item: 'text-warning' },
  }

  const activeSections = sections.filter((s) => s.list.length > 0)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div initial={fadeUp.initial} animate={fadeUp.animate} transition={fadeUp.animate.transition} className="will-change-transform">
        <PageHeader
          eyebrow="Comparison"
          accent="teal"
          title="Prescription Comparison"
          description="Visual summary of changes between the current and previous prescription."
          breadcrumbs={[
            { label: 'Prescriptions', href: '/doctor/search' },
            { label: 'Comparison' },
          ]}
        />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }} className="will-change-transform">
        <Link to={`/doctor/prescriptions/${id}`} className="inline-flex items-center gap-2 px-3.5 py-2 border border-border text-foreground-secondary text-sm font-medium rounded-lg hover:bg-surface-muted">
          <ArrowLeft className="h-4 w-4" /> Back to Prescription
        </Link>
      </motion.div>

      <motion.div variants={staggerContainer(0.06)} initial="initial" animate="animate" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <motion.div variants={staggerItem} initial="initial" animate="animate" transition={{ ...fadeScale.animate.transition, delay: 0 }} className="card-surface p-5 will-change-transform">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25, delay: 0.1 }}>
            <p className="text-xs text-foreground-muted uppercase tracking-wide">Previous</p>
            <p className="text-sm font-semibold text-foreground mt-1.5"><DateDisplay date={data.previousDate} format="dd MMM yyyy" /></p>
          </motion.div>
        </motion.div>
        <motion.div variants={staggerItem} className="will-change-transform">
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1], delay: 0.06 }} className="card-surface surface-teal p-5 will-change-transform">
            <p className="text-xs text-secondary-600 uppercase tracking-wide">Current</p>
            <p className="text-sm font-semibold text-foreground mt-1.5"><DateDisplay date={data.currentDate} format="dd MMM yyyy" /></p>
          </motion.div>
        </motion.div>
      </motion.div>

      {activeSections.length === 0 ? (
        <motion.div initial={fadeScale.initial} animate={fadeScale.animate} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1], delay: 0.18 }} className="card-surface will-change-transform">
          <EmptyState
            icon={FileText}
            title="No changes detected"
            description="This prescription matches the previous one with no additions, removals, or dosage changes."
            className="py-14"
          />
        </motion.div>
      ) : (
        <motion.div variants={staggerContainer(0.07)} initial="initial" animate="animate" className="grid grid-cols-1 gap-4">
          {activeSections.map((section) => {
            const tone = toneStyles[section.tone]
            return (
              <motion.div key={section.key} variants={staggerItem} initial="initial" animate="animate" className={cn('rounded-xl border p-5 will-change-transform', tone.card)}>
                <motion.div initial={{ scale: 0.97, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} className="flex items-center gap-2.5 will-change-transform">
                  <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1], delay: 0.08 }} className={cn('w-8 h-8 rounded-lg flex items-center justify-center will-change-transform', tone.iconBg)}>
                    <section.icon className="h-4 w-4" />
                  </motion.div>
                  <h3 className={cn('text-[15px] font-semibold', tone.text)}>{section.label}</h3>
                  <motion.span initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 18, delay: 0.12 }} className={cn('text-xs font-medium ml-auto px-2 py-0.5 rounded-full will-change-transform', tone.iconBg)}>
                    {section.list.length}
                  </motion.span>
                </motion.div>
                <motion.ul variants={staggerContainer(0.03)} initial="initial" animate="animate" className="mt-3 space-y-1.5">
                  {section.list.map((m, i) => (
                    <motion.li key={i} variants={staggerItem} initial="initial" animate="animate" transition={{ duration: 0.2 }} className={cn('text-sm ml-10 will-change-transform', tone.item)}>
                      {section.render(m)}
                    </motion.li>
                  ))}
                </motion.ul>
              </motion.div>
            )
          })}
        </motion.div>
      )}
    </div>
  )
}
