import { format, formatDistanceToNow } from 'date-fns'
import { cn } from '@/utils/cn'

export default function DateDisplay({ 
  date, 
  format: formatStr = 'dd MMM yyyy', 
  relative = false, 
  className,
  fallback = 'N/A'
}) {
  if (!date) return <span className={cn('text-foreground-muted', className)}>{fallback}</span>

  const dateObj = typeof date === 'string' ? new Date(date) : date

  if (isNaN(dateObj.getTime())) {
    return <span className={cn('text-foreground-muted', className)}>{fallback}</span>
  }

  if (relative) {
    return <span className={cn(className)}>{formatDistanceToNow(dateObj, { addSuffix: true })}</span>
  }

  return <span className={cn(className)}>{format(dateObj, formatStr)}</span>
}