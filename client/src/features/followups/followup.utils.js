import { format } from 'date-fns'
import { FOLLOWUP_STATUS_CONFIG } from '@/constants'

export function formatFollowUpDate(date) {
  if (!date) return 'N/A'
  return format(new Date(date), 'dd MMM yyyy')
}

export function formatFollowUpDateTime(date) {
  if (!date) return 'N/A'
  return format(new Date(date), 'dd MMM yyyy HH:mm')
}

export function getFollowUpStatusConfig(status) {
  return FOLLOWUP_STATUS_CONFIG[status] || { label: status, color: 'gray' }
}
