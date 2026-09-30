import { Bell } from 'lucide-react'
import { EmptyState } from '@/components/common'

export default function NoNotifications({ className }) {
  return (
    <EmptyState
      icon={Bell}
      title="No notifications"
      description="You're all caught up! New notifications will appear here."
      className={className}
      tint="blue"
    />
  )
}