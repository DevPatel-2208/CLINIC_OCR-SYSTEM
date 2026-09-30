import { cn } from '@/utils/cn'

export default function TimelineSkeleton({ items = 5, className }) {
  return (
    <div className={cn('relative', className)}>
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-surface-muted" />
      <div className="space-y-6">
        {Array.from({ length: items }).map((_, i) => (
          <div key={i} className="relative pl-12 animate-pulse">
            <div className="absolute left-2.5 w-4 h-4 rounded-full bg-surface-muted" />
            <div className="bg-surface rounded-lg border p-4">
              <div className="h-3 bg-surface-muted rounded w-24" />
              <div className="h-4 bg-surface-muted rounded w-32 mt-2" />
              <div className="h-3 bg-surface-muted rounded w-48 mt-1" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}