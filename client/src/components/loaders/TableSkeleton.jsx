import { cn } from '@/utils/cn'

export default function TableSkeleton({ rows = 5, columns = 4, className }) {
  return (
    <div className={cn('animate-pulse', className)}>
      <div className="bg-surface rounded-lg border border-border overflow-hidden">
        <div className="bg-surface-muted border-b border-border px-4 py-3">
          <div className="flex gap-4">
            {Array.from({ length: columns }).map((_, i) => (
              <div key={i} className="h-4 bg-surface-muted rounded w-1/4" />
            ))}
          </div>
        </div>
        <div className="divide-y divide-border">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="px-4 py-3">
              <div className="flex gap-4">
                {Array.from({ length: columns }).map((_, j) => (
                  <div key={j} className="h-4 bg-surface-muted rounded flex-1" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}