import { format } from 'date-fns'

export function formatNotificationDate(date) {
  if (!date) return ''
  return format(new Date(date), 'dd MMM yyyy HH:mm')
}

export function getUnreadCount(notifications) {
  return notifications?.filter((n) => !n.read)?.length || 0
}
