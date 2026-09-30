import { FileText } from 'lucide-react'
import { EmptyState } from '@/components/common'
import Button from '@/components/ui/Button'

export default function NoPrescriptions({ onUpload, className }) {
  return (
    <EmptyState
      icon={FileText}
      title="No prescriptions found"
      description="Upload a prescription image to get started with AI-powered extraction."
      action={onUpload && <Button onClick={onUpload} size="sm"><span className="flex items-center gap-1">+ Upload Prescription</span></Button>}
      className={className}
      tint="teal"
    />
  )
}