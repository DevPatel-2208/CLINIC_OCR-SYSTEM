import { cva } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import { motion } from 'motion'
import { cn } from '@/utils/cn'
import { duration, ease } from '@/motion/tokens'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500 dark:focus-visible:ring-offset-surface disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-white hover:bg-primary-700 active:bg-primary-800 shadow-card hover:shadow-card-hover dark:bg-primary-400 dark:hover:bg-primary-300 dark:active:bg-primary-500',
        secondary:
          'bg-secondary text-white hover:bg-secondary-700 active:bg-secondary-800 shadow-card hover:shadow-card-hover dark:bg-secondary-500 dark:hover:bg-secondary-400',
        outline:
          'border border-border bg-surface text-foreground hover:bg-surface-muted active:bg-surface-muted hover:border-primary-300 hover:shadow-card dark:border-border dark:bg-surface dark:hover:bg-surface-muted dark:hover:border-primary-400',
        ghost:
          'text-foreground-secondary hover:bg-surface-muted active:bg-surface-muted dark:text-foreground-secondary dark:hover:bg-surface-muted',
        danger: 'bg-error text-white hover:bg-error-dark active:bg-error-dark shadow-card hover:shadow-card-hover',
        'danger-ghost':
          'text-error hover:bg-error-surface active:bg-error-surface border border-transparent hover:border-error/20',
        soft:
          'bg-primary-50 text-primary-700 hover:bg-primary-100 active:bg-primary-200 dark:bg-primary-900/30 dark:text-primary-300 dark:hover:bg-primary-900/50',
        'soft-teal':
          'bg-secondary-50 text-secondary-700 hover:bg-secondary-100 active:bg-secondary-200 dark:bg-secondary-900/30 dark:text-secondary-300 dark:hover:bg-secondary-900/50',
        'soft-cyan':
          'bg-cyan-50 text-cyan-700 hover:bg-cyan-100 active:bg-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300 dark:hover:bg-cyan-900/50',
      },
      size: {
        xs: 'h-7 px-2.5 text-xs rounded-lg',
        sm: 'h-8 px-3 text-xs rounded-lg',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base rounded-xl',
        xl: 'h-14 px-8 text-lg rounded-xl',
        icon: 'h-10 w-10 p-0 rounded-xl',
        'icon-sm': 'h-8 w-8 p-0 rounded-lg',
        'icon-lg': 'h-12 w-12 p-0 rounded-xl',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  }
)

export default function Button({
  children,
  variant,
  size,
  disabled = false,
  loading = false,
  loadingText = 'Processing...',
  className,
  onClick,
  type = 'button',
  fullWidth = false,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  ...props
}) {
  const isDisabled = disabled || loading
  return (
    <motion.button
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      aria-busy={loading || undefined}
      className={cn(buttonVariants({ variant, size, fullWidth }), className)}
      whileHover={isDisabled ? undefined : { filter: 'brightness(1.06)' }}
      whileTap={isDisabled ? undefined : { scale: 0.98, filter: 'brightness(0.98)' }}
      transition={{ duration: duration.fast, ease: ease.out }}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        <>
          {LeftIcon && !loading && <LeftIcon className={cn('h-4 w-4', size === 'xs' && 'h-3.5 w-3.5', size === 'sm' && 'h-3.5 w-3.5', size === 'lg' && 'h-5 w-5', size === 'xl' && 'h-5 w-5')} aria-hidden="true" />}
          {loading ? loadingText : children}
          {RightIcon && !loading && <RightIcon className={cn('h-4 w-4', size === 'xs' && 'h-3.5 w-3.5', size === 'sm' && 'h-3.5 w-3.5', size === 'lg' && 'h-5 w-5', size === 'xl' && 'h-5 w-5')} aria-hidden="true" />}
        </>
      )}
    </motion.button>
  )
}
