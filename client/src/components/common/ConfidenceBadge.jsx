import { cn } from '@/utils/cn'

export default function ConfidenceBadge({ value, showLabel = true, className, showIcon = false }) {
  const getStyle = (conf) => {
    if (conf >= 80) return { bg: 'bg-success-surface text-success border-success/20 dark:bg-success-surface-dark dark:text-success-light dark:border-success/30', label: 'High', bar: 'bg-success' }
    if (conf >= 60) return { bg: 'bg-warning-surface text-warning border-warning/20 dark:bg-warning-surface-dark dark:text-warning-light dark:border-warning/30', label: 'Medium', bar: 'bg-warning' }
    return { bg: 'bg-error-surface text-error border-error/20 dark:bg-error-surface-dark dark:text-error-light dark:border-error/30', label: 'Low', bar: 'bg-error' }
  }

  const style = getStyle(typeof value === 'number' ? value : 0)

  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <div className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-full border', style.bg)}>
        {showLabel && <span>{style.label}</span>}
        <span className="font-semibold">{value}%</span>
      </div>
      <div className="hidden sm:block w-14 h-1.5 bg-border rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full', style.bar)} style={{ width: `${Math.min(100, Math.max(0, value || 0))}%` }} />
      </div>
    </div>
  )
}
