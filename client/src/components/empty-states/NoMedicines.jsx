import { Pill } from 'lucide-react'
import { EmptyState } from '@/components/common'

export default function NoMedicines({ className }) {
  return (
    <EmptyState
      icon={Pill}
      title="No medicine history"
      description="Medicines will appear here once prescriptions are approved."
      className={className}
      tint="teal"
    />
  )
}