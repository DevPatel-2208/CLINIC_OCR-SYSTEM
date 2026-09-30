import { cn } from '@/utils/cn'

export default function PrescriptionSkeleton({ className }) {
  return (
    <div className={cn('animate-pulse', className)}>
      <div className="grid grid-cols-2 gap-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-surface rounded-xl border shadow-sm p-5">
            <div className="h-3 bg-surface-muted rounded w-1/4 mb-1" />
            <div className="h-5 bg-surface-muted rounded w-1/2" />
            <div className="h-3 bg-surface-muted rounded w-1/3 mt-1" />
          </div>
        ))}
      </div>

      <div className="bg-surface rounded-xl border shadow-sm p-5 mb-6">
        <div className="h-5 bg-surface-muted rounded w-24 mb-3" />
        <div className="aspect-[4/3] bg-surface-muted rounded-lg" />
      </div>

      <div className="bg-surface rounded-xl border shadow-sm p-5">
        <div className="h-5 bg-surface-muted rounded w-20 mb-3" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="grid grid-cols-4 gap-2">
              <div className="h-4 bg-surface-muted rounded" />
              <div className="h-4 bg-surface-muted rounded" />
              <div className="h-4 bg-surface-muted rounded" />
              <div className="h-4 bg-surface-muted rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}