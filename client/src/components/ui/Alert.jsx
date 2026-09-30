import { Info, CheckCircle, AlertTriangle, XCircle, X } from 'lucide-react'
import { cn } from '@/utils/cn'

const variantStyles = {
  info: {
    container: 'bg-info-surface border-info/20 dark:bg-info-surface/20 dark:border-info/30',
    icon: Info,
    iconColor: 'text-info',
    titleColor: 'text-info dark:text-info',
    messageColor: 'text-info/80 dark:text-info/80',
  },
  success: {
    container: 'bg-success-surface border-success/20 dark:bg-success-surface/20 dark:border-success/30',
    icon: CheckCircle,
    iconColor: 'text-success',
    titleColor: 'text-success dark:text-success',
    messageColor: 'text-success/80 dark:text-success/80',
  },
  warning: {
    container: 'bg-warning-surface border-warning/20 dark:bg-warning-surface/20 dark:border-warning/30',
    icon: AlertTriangle,
    iconColor: 'text-warning',
    titleColor: 'text-warning dark:text-warning',
    messageColor: 'text-warning/80 dark:text-warning/80',
  },
  error: {
    container: 'bg-error-surface border-error/20 dark:bg-error-surface/20 dark:border-error/30',
    icon: XCircle,
    iconColor: 'text-error',
    titleColor: 'text-error dark:text-error',
    messageColor: 'text-error/80 dark:text-error/80',
  },
}

export default function Alert({
  variant = 'info',
  title,
  message,
  icon: CustomIcon,
  onDismiss,
  className,
}) {
  const styles = variantStyles[variant]
  const IconComponent = CustomIcon || styles.icon

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-lg border p-4',
        styles.container,
        className
      )}
      role="alert"
    >
      <IconComponent className={cn('h-5 w-5 mt-0.5 shrink-0', styles.iconColor)} />
      <div className="flex-1">
        {title && <p className={cn('text-sm font-medium', styles.titleColor)}>{title}</p>}
        {message && <p className={cn('text-sm mt-1', styles.messageColor)}>{message}</p>}
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="shrink-0 p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        >
          <X className={cn('h-4 w-4', styles.iconColor)} />
        </button>
      )}
    </div>
  )
}
