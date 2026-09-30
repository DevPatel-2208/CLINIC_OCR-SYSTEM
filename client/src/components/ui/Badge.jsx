import { cva } from 'class-variance-authority'
import { cn } from '@/utils/cn'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
  {
    variants: {
      variant: {
        success: 'bg-success-surface text-success border border-success/20 dark:bg-success-surface dark:text-success dark:border-success/30',
        warning: 'bg-warning-surface text-warning border border-warning/20 dark:bg-warning-surface dark:text-warning dark:border-warning/30',
        danger: 'bg-error-surface text-error border border-error/20 dark:bg-error-surface dark:text-error dark:border-error/30',
        info: 'bg-info-surface text-info border border-info/20 dark:bg-info-surface dark:text-info dark:border-info/30',
        primary: 'bg-primary-50 text-primary-700 border border-primary-200 dark:bg-primary-900/30 dark:text-primary-300 dark:border-primary-700',
        secondary: 'bg-secondary-50 text-secondary-700 border border-secondary-200 dark:bg-secondary-900/30 dark:text-secondary-300 dark:border-secondary-700',
        cyan: 'bg-cyan-50 text-cyan-700 border border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-700',
        purple: 'bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700',
        default: 'bg-surface-muted text-foreground-secondary border border-border dark:bg-surface-muted dark:text-foreground-muted',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export default function Badge({ children, variant, className }) {
  return (
    <span className={cn(badgeVariants({ variant }), className)}>
      {children}
    </span>
  )
}
