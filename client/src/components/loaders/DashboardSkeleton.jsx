import { cn } from '@/utils/cn'

export default function DashboardSkeleton({ statsCount = 4, className }) {
  return (
    <div className={cn('animate-pulse', className)}>
      <div className="h-6 bg-surface-muted rounded w-1/4 mb-8" />
      <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4', statsCount === 5 && 'lg:grid-cols-5')}>
        {Array.from({ length: statsCount }).map((_, i) => (
          <div key={i} className="bg-surface rounded-xl p-5 border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-surface-muted" />
              <div>
                <div className="h-6 bg-surface-muted rounded w-24" />
                <div className="h-3 bg-surface-muted rounded w-16 mt-2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}