import { cn } from '@/utils/cn'

export default function ChartSkeleton({ type = 'bar', height = 300 }) {
  return (
    <div className="animate-pulse w-full" style={{ height }}>
      <div className="h-full bg-surface-muted rounded-xl border border-border p-5 flex flex-col">
        <div className="h-4 bg-surface-muted rounded w-1/3 mb-2" />
        <div className="h-3 bg-surface-muted rounded w-1/2 mb-6" />

        <div className="flex-1 flex items-end gap-2 px-2">
          {type === 'pie' ? (
            <div className="w-full flex items-center justify-center">
              <div className="w-32 h-32 rounded-full bg-surface-muted" />
            </div>
          ) : (
            Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'flex-1 bg-surface-muted rounded-t',
                  type === 'line' && 'rounded',
                )}
                style={{
                  height: `${Math.max(15, Math.random() * 85)}%`,
                }}
              />
            ))
          )}
        </div>

        {type === 'bar' && (
          <div className="flex justify-between mt-2 px-1">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-2 bg-surface-muted rounded w-6" />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}