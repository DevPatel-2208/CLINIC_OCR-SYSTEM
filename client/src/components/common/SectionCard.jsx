import { cn } from '@/utils/cn'
import { motion } from 'motion'
import { fadeUp } from '@/motion/variants'
import { duration, ease } from '@/motion/tokens'

export default function SectionCard({
  title,
  description,
  icon: Icon,
  iconColor = 'text-primary',
  iconBg = 'bg-primary-50 dark:bg-primary-50/20',
  tint,
  action,
  children,
  className,
  contentClassName,
  bodyClassName,
  interactive = false,
  onClick,
}) {
  const isInteractive = interactive || !!onClick
  return (
    <motion.div
      initial={fadeUp.initial}
      whileInView={fadeUp.animate}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: duration.smooth, ease: ease.out }}
      whileHover={isInteractive ? { y: -2, boxShadow: 'var(--shadow-card-hover)' } : undefined}
      onClick={onClick}
        className={cn(
        'rounded-xl border border-border shadow-card transition-colors duration-200 will-change-transform',
        tint ? `surface-${tint}` : 'bg-surface',
        isInteractive && 'cursor-pointer',
        className
      )}
      style={isInteractive ? { transform: 'translateZ(0)' } : undefined}
    >
      {(title || action || Icon) && (
        <div className={cn('px-4 sm:px-5 py-4 border-b flex items-center justify-between gap-4', tint ? `tinted-header-${tint}` : 'border-border bg-surface')}>
          <div className="flex items-center gap-3 min-w-0">
            {Icon && (
              <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', iconBg)}>
                <Icon className={cn('h-[18px] w-[18px]', iconColor)} />
              </div>
            )}
            <div className="min-w-0">
              {title && <h3 className="text-[15px] font-semibold text-foreground leading-tight">{title}</h3>}
              {description && <p className="text-[13px] text-foreground-muted mt-0.5">{description}</p>}
            </div>
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      )}
      <div className={cn('p-4 sm:p-5', contentClassName)}>
        {bodyClassName ? <div className={bodyClassName}>{children}</div> : children}
      </div>
    </motion.div>
  )
}
