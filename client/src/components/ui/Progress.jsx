import { cn } from '@/utils/cn'

const variantStyles = {
  default: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
}

const sizeStyles = {
  sm: 'h-1.5',
  md: 'h-2.5',
}

export default function Progress({
  value = 0,
  variant = 'default',
  size = 'md',
  showLabel = false,
  className,
}) {
  const clampedValue = Math.min(100, Math.max(0, value))

  return (
    <div className={cn('w-full', className)}>
      <div
        className="w-full bg-surface-muted rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={clampedValue}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={cn(
            'rounded-full transition-all duration-300',
            variantStyles[variant],
            sizeStyles[size]
          )}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
      {showLabel && (
        <p className="text-xs text-foreground-muted mt-1 text-right">{clampedValue}%</p>
      )}
    </div>
  )
}
