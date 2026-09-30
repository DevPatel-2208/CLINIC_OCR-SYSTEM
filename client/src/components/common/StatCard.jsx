import { cn } from '@/utils/cn'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { motion } from 'motion'
import CountUp from '@/motion/CountUp'
import { staggerItem } from '@/motion/variants'
import { duration, ease } from '@/motion/tokens'

const tintMap = {
  blue: 'surface-blue',
  teal: 'surface-teal',
  cyan: 'surface-cyan',
  purple: 'surface-purple',
  green: 'surface-green',
  amber: 'surface-amber',
  red: 'surface-red',
  slate: 'surface-slate',
  default: '',
}

export default function StatCard({
  label,
  value,
  icon: Icon,
  color = 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300',
  tint,
  accent,
  trend,
  trendUp = true,
  highlight = false,
  className,
  suffix,
  subLabel,
  onClick,
}) {
  const isNumericValue = typeof value === 'number'
  const isClickable = !!onClick
  return (
    <motion.div
      onClick={onClick}
      variants={staggerItem}
      initial="initial"
      animate="animate"
      whileHover={{ y: -3, boxShadow: 'var(--shadow-card-hover)' }}
      transition={{ duration: duration.normal, ease: ease.out }}
      className={cn(
        'card-surface group relative overflow-hidden p-4 sm:p-5 will-change-transform',
        tint && tintMap[tint],
        accent && `accent-top-${accent}`,
        onClick && 'cursor-pointer',
        highlight && 'ring-2 ring-error/30',
        className
      )}
      style={{ transform: 'translateZ(0)' }}
    >
      <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-primary-50/50 dark:bg-primary-400/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="relative flex items-center justify-between gap-3">
        <div className={cn('w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 shadow-xs transition-transform duration-200 group-hover:scale-105', color)}>
          <Icon className="h-5 w-5" />
        </div>
        {trend !== undefined && (
          <span
            className={cn(
              'inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full',
              trendUp ? 'bg-success-surface text-success' : 'bg-error-surface text-error'
            )}
          >
            {trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {trend}%
          </span>
        )}
      </div>
      <div className="relative mt-3 sm:mt-4">
        <p className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight leading-none">
          {isNumericValue ? <CountUp value={value} /> : value}
          {suffix && <span className="text-base sm:text-lg font-semibold text-foreground-muted">{suffix}</span>}
        </p>
        <p className="mt-1.5 text-sm font-medium text-foreground-secondary">{label}</p>
        {subLabel && <p className="mt-0.5 text-xs text-foreground-muted">{subLabel}</p>}
      </div>
    </motion.div>
  )
}
