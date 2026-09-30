import { format } from 'date-fns'
import { PROCESSING_STATUS, PROCESSING_STATUS_CONFIG } from '@/constants'

export function formatPrescriptionDate(date) {
  if (!date) return 'N/A'
  return format(new Date(date), 'dd MMM yyyy')
}

export function formatPrescriptionDateTime(date) {
  if (!date) return 'N/A'
  return format(new Date(date), 'dd MMM yyyy HH:mm')
}

export function getStatusConfig(status) {
  return PROCESSING_STATUS_CONFIG[status] || { label: status, color: 'gray' }
}

export function getStatusColor(status) {
  const config = getStatusConfig(status)
  const colors = {
    gray: 'bg-surface-muted text-foreground-secondary',
    blue: 'bg-info-surface text-info',
    yellow: 'bg-warning-surface text-warning',
    purple: 'bg-primary-50 text-primary-700 dark:text-primary-300',
    orange: 'bg-warning-surface text-warning',
    green: 'bg-success-surface text-success',
    red: 'bg-error-surface text-error',
  }
  return colors[config.color] || colors.gray
}

export function isApproved(prescription) {
  return prescription?.processingStatus === PROCESSING_STATUS.APPROVED
}

export function isPendingReview(prescription) {
  return prescription?.processingStatus === PROCESSING_STATUS.NEEDS_REVIEW
}

export function getConfidenceColor(confidence) {
  if (confidence >= 80) return 'text-success'
  if (confidence >= 60) return 'text-warning'
  return 'text-error'
}

export function getConfidenceBg(confidence) {
  if (confidence >= 80) return 'bg-success-surface text-success'
  if (confidence >= 60) return 'bg-warning-surface text-warning'
  return 'bg-error-surface text-error'
}
