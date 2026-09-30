import { cn } from '@/utils/cn'

export default function Separator({
  orientation = 'horizontal',
  className,
}) {
  return (
    <hr
      className={cn(
        'border-border',
        orientation === 'horizontal'
          ? 'w-full border-t'
          : 'h-full border-l inline-block',
        className
      )}
    />
  )
}
