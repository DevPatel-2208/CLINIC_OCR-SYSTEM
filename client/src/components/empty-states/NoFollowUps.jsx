import { Calendar } from 'lucide-react'
import { EmptyState } from '@/components/common'
import Button from '@/components/ui/Button'

export default function NoFollowUps({ onAdd, className }) {
  return (
    <EmptyState
      icon={Calendar}
      title="No follow-ups scheduled"
      description="Schedule follow-up visits for your patients."
      action={onAdd && <Button onClick={onAdd} size="sm"><span className="flex items-center gap-1">+ Schedule Follow-up</span></Button>}
      className={className}
      tint="green"
    />
  )
}