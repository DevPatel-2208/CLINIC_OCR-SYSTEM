import { Users } from 'lucide-react'
import { EmptyState } from '@/components/common'
import Button from '@/components/ui/Button'

export default function NoPatients({ onAdd, className }) {
  return (
    <EmptyState
      icon={Users}
      title="No patients found"
      description="Get started by adding your first patient to the system."
      action={onAdd && <Button onClick={onAdd} size="sm"><span className="flex items-center gap-1">+ Add Patient</span></Button>}
      className={className}
      tint="blue"
    />
  )
}