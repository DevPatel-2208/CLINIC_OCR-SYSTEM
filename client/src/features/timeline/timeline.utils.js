import { format } from 'date-fns'

export function formatTimelineDate(date) {
  if (!date) return 'N/A'
  return format(new Date(date), 'dd MMM yyyy')
}

export function getEventColor(type) {
  const colors = {
    PRESCRIPTION: 'bg-primary-500',
    MEDICINE: 'bg-success',
    FOLLOWUP: 'bg-warning',
    NOTE: 'bg-foreground-muted',
  }
  return colors[type] || 'bg-foreground-muted'
}

export function sortTimelineByDate(events) {
  return [...events].sort((a, b) => new Date(b.date) - new Date(a.date))
}
