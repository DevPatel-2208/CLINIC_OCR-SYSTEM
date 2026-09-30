import { FileText } from 'lucide-react'
import { EmptyState } from '@/components/common'

export default function NoRecords({ title = 'No records found', description, className }) {
  return (
    <EmptyState
      icon={FileText}
      title={title}
      description={description || 'No records match the current filters.'}
      className={className}
    />
  )
}