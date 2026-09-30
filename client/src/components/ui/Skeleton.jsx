import { cn } from '@/utils/cn'

export default function Skeleton({
  variant = 'text',
  width,
  height,
  className,
  count = 1,
}) {
  const baseClass = 'relative overflow-hidden'
  const bgClass = 'bg-skeleton-base'

  const variantClasses = {
    text: 'h-4 w-full rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  }

  const style = {
    ...(width && { width }),
    ...(height && { height }),
  }

  const items = Array.from({ length: count }, (_, i) => i)

  return (
    <>
      {items.map((i) => (
        <div
          key={i}
          className={cn(baseClass, bgClass, variantClasses[variant], className)}
          style={style}
          aria-hidden="true"
        >
          <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-skeleton-shine to-transparent" />
        </div>
      ))}
    </>
  )
}
