import { FileText } from 'lucide-react'
import { EmptyState } from '@/components/common'
import Button from '@/components/ui/Button'

export default function NoDocuments({ onUpload, className }) {
  return (
    <EmptyState
      icon={FileText}
      title="No documents uploaded"
      description="Upload lab results, scans, or other medical documents."
      action={onUpload && <Button onClick={onUpload} size="sm"><span className="flex items-center gap-1">+ Upload Document</span></Button>}
      className={className}
      tint="slate"
    />
  )
}