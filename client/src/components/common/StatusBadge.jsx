import { cn } from '@/utils/cn'

// Maps arbitrary status labels onto the ClinicOCR semantic palette.
// "keyed" entries are used when the exact status needs a distinct tone.
const toneMap = {
  success: {
    badge: 'bg-success-surface text-success border border-success/25 dark:bg-success-light/15 dark:text-success dark:border-success/30',
    dot: 'bg-success',
  },
  warning: {
    badge: 'bg-warning-surface text-warning border border-warning/25 dark:bg-warning-light/15 dark:text-warning dark:border-warning/30',
    dot: 'bg-warning',
  },
  danger: {
    badge: 'bg-error-surface text-error border border-error/25 dark:bg-error-light/15 dark:text-error dark:border-error/30',
    dot: 'bg-error',
  },
  info: {
    badge: 'bg-info-surface text-info border border-info/25 dark:bg-info-light/15 dark:text-info dark:border-info/30',
    dot: 'bg-info',
  },
  primary: {
    badge: 'bg-primary-50 text-primary-800 border border-primary-200 dark:bg-primary-50/15 dark:text-primary-100 dark:border-primary-700',
    dot: 'bg-primary',
  },
  secondary: {
    badge: 'bg-secondary-50 text-secondary-700 border border-secondary-200 dark:bg-secondary-50/15 dark:text-secondary-100 dark:border-secondary-800',
    dot: 'bg-secondary',
  },
  cyan: {
    badge: 'bg-accent-surface text-accent-600 border border-accent-600/25 dark:bg-accent-50/15 dark:text-accent-600 dark:border-accent-600/30',
    dot: 'bg-accent-600',
  },
  neutral: {
    badge: 'bg-surface-muted text-foreground-secondary border border-border dark:bg-surface-muted/40 dark:text-foreground-secondary',
    dot: 'bg-foreground-muted',
  },
}

const statusTones = {
  // Booking / appointment
  booked: 'info',
  checked_in: 'cyan',
  triage: 'warning',
  consultation: 'primary',
  completed: 'success',
  cancelled: 'danger',
  no_show: 'danger',
  scheduled: 'info',
  // Follow-up
  UPCOMING: 'info',
  COMPLETED: 'success',
  MISSED: 'danger',
  CANCELLED: 'neutral',
  // User
  CONFIRMED: 'success',
  PENDING: 'warning',
  ACTIVE: 'success',
  INACTIVE: 'neutral',
  // Processing
  UPLOADED: 'neutral',
  IMAGE_PROCESSING: 'primary',
  OCR_PROCESSING: 'cyan',
  AI_PROCESSING: 'secondary',
  NEEDS_REVIEW: 'warning',
  APPROVED: 'success',
  REJECTED: 'danger',
  PROCESSING_FAILED: 'danger',
}

export default function StatusBadge({ status, className, showDot = true }) {
  const tone = toneMap[statusTones[status] || 'neutral']
  const label = String(status || '').replace(/_/g, ' ')

  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize', tone.badge, className)}>
      {showDot && <span className={cn('h-1.5 w-1.5 rounded-full', tone.dot)} aria-hidden="true" />}
      {label}
    </span>
  )
}
