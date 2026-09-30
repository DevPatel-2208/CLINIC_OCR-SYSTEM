import { cn } from '@/utils/cn'
import { Loader2 } from 'lucide-react'

export default function ButtonLoader({ 
  loading = false, 
  children, 
  className,
  size = 'md',
  variant = 'primary',
  disabled = false,
  onClick,
  ...props
}) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  const variantClasses = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700',
    secondary: 'bg-surface-muted text-foreground hover:bg-surface-muted',
    outline: 'border border-border text-foreground-secondary hover:bg-surface-muted',
    ghost: 'text-foreground-secondary hover:bg-surface-muted',
    danger: 'bg-error text-white hover:bg-error-dark',
  }

  return (
    <button
      type="button"
      disabled={disabled || loading}
      onClick={onClick}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  )
}