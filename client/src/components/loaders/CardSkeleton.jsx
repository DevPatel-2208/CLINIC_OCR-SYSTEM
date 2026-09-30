import { cn } from '@/utils/cn'

export default function CardSkeleton({ className }) {
  return (
    <div className={cn('animate-pulse bg-surface rounded-xl border border-border p-5', className)}>
      <div className="h-4 bg-surface-muted rounded w-1/3 mb-2" />
      <div className="h-3 bg-surface-muted rounded w-1/2 mb-4" />
      <div className="space-y-3">
        <div className="h-3 bg-surface-muted rounded w-full" />
        <div className="h-3 bg-surface-muted rounded w-3/4" />
        <div className="h-3 bg-surface-muted rounded w-1/2" />
      </div>
    </div>
  )
}