import { cn } from '@/utils/cn'
import { Loader2 } from 'lucide-react'

export default function PageLoader({ message = 'Loading...', size = 'md', className }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  }

  return (
    <div className={cn('flex flex-col items-center justify-center py-12', className)}>
      <Loader2 className={cn(sizeClasses[size], 'animate-spin text-primary-600')} />
      {message && <p className="text-sm text-foreground-muted mt-3">{message}</p>}
    </div>
  )
}