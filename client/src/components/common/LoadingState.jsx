import { Loader2 } from 'lucide-react'
import { cn } from '@/utils/cn'

export default function LoadingState({ message = 'Loading...', size = 'md', className, fullScreen = false }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-9 w-9',
  }

  const content = (
    <div className={cn('flex flex-col items-center gap-3 text-foreground-muted', className)}>
      <Loader2 className={cn(sizeClasses[size], 'animate-spin text-primary-600')} aria-hidden="true" />
      {message && (
        <p className="text-sm" role="status" aria-live="polite">
          {message}
        </p>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-surface/70 backdrop-blur-sm flex items-center justify-center z-50">
        {content}
      </div>
    )
  }

  return <div className="flex items-center justify-center">{content}</div>
}
