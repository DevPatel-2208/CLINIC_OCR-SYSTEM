import { cn } from '@/utils/cn'

export default function PatientProfileSkeleton({ className }) {
  return (
    <div className={cn('animate-pulse', className)}>
      <div className="bg-surface rounded-xl border shadow-sm p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-surface-muted rounded-full" />
          <div className="flex-1">
            <div className="h-6 bg-surface-muted rounded w-48" />
            <div className="h-4 bg-surface-muted rounded w-32 mt-2" />
            <div className="h-4 bg-surface-muted rounded w-24 mt-2" />
          </div>
          <div className="text-right">
            <div className="h-8 bg-surface-muted rounded w-20" />
            <div className="h-3 bg-surface-muted rounded w-16 mt-1" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface rounded-xl border shadow-sm p-5">
          <div className="h-5 bg-surface-muted rounded w-32 mb-3" />
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 bg-surface-muted rounded" />
            ))}
          </div>
        </div>

        <div className="bg-surface rounded-xl border shadow-sm p-5">
          <div className="h-5 bg-surface-muted rounded w-32 mb-3" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-8 bg-surface-muted rounded" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}