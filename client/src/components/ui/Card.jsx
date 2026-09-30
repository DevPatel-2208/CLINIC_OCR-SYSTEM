import { cva } from 'class-variance-authority'
import { motion } from 'motion'
import { cn } from '@/utils/cn'
import { duration, ease } from '@/motion/tokens'

const cardVariants = cva(
  'rounded-xl border border-border bg-surface',
  {
    variants: {
      elevation: {
        flat: '',
        soft: 'shadow-card',
        raised: 'shadow-card-hover',
        overlay: 'shadow-dropdown',
        modal: 'shadow-modal',
      },
      padding: {
        none: '',
        sm: 'p-3',
        md: 'p-4 sm:p-5',
        lg: 'p-6',
        xl: 'p-8',
      },
      hover: {
        false: '',
        true: 'transition-all duration-200 hover:shadow-card-hover hover:border-primary-200 dark:hover:border-primary-700',
      },
      interactive: {
        false: '',
        true: 'cursor-pointer text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover hover:border-primary-200 dark:hover:border-primary-700',
      },
    },
    defaultVariants: {
      elevation: 'soft',
      padding: 'md',
      hover: false,
      interactive: false,
    },
  }
)

export default function Card({
  children,
  className,
  padding = 'md',
  hover = false,
  interactive = false,
  onClick,
  elevation = 'soft',
  asChild = false,
  ...props
}) {
  const isInteractive = interactive || !!onClick
  const Tag = (onClick || interactive) && !asChild ? 'button' : 'div'
  const MotionTag = Tag === 'button' ? motion.button : motion.div

  if (isInteractive || hover) {
    return (
      <MotionTag
        onClick={onClick}
        className={cn(
          cardVariants({ elevation, padding, hover, interactive }),
          'will-change-transform',
          className
        )}
        whileHover={isInteractive ? { y: -2, boxShadow: 'var(--shadow-card-hover)' } : { y: -1, boxShadow: 'var(--shadow-card-hover)' }}
        transition={{ duration: duration.normal, ease: ease.out }}
        {...(Tag === 'button' ? { type: 'button' } : {})}
        {...props}
      >
        {children}
      </MotionTag>
    )
  }

  return (
    <Tag
      onClick={onClick}
      className={cn(
        cardVariants({ elevation, padding, hover, interactive }),
        className
      )}
      {...(Tag === 'button' ? { type: 'button' } : {})}
      {...props}
    >
      {children}
    </Tag>
  )
}

export function CardHeader({ children, className, ...props }) {
  return (
    <div className={cn('mb-4', className)} {...props}>
      {children}
    </div>
  )
}

export function CardTitle({ children, className, ...props }) {
  return (
    <h3 className={cn('text-lg font-semibold text-foreground leading-tight', className)} {...props}>
      {children}
    </h3>
  )
}

export function CardDescription({ children, className, ...props }) {
  return (
    <p className={cn('text-sm text-foreground-muted mt-1', className)} {...props}>
      {children}
    </p>
  )
}

export function CardContent({ children, className, ...props }) {
  return (
    <div className={cn('', className)} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({ children, className, ...props }) {
  return (
    <div className={cn('mt-4 pt-4 border-t border-border flex items-center gap-3', className)} {...props}>
      {children}
    </div>
  )
}
