import { Shield } from 'lucide-react'
import { EmptyState } from '@/components/common'

export default function NoAuditLogs({ className }) {
  return (
    <EmptyState
      icon={Shield}
      title="No audit logs"
      description="Audit logs will appear here as actions are performed."
      className={className}
      tint="slate"
    />
  )
}