import { Inbox } from 'lucide-react'
import { motion } from "motion"
import { cn } from '@/utils/cn'
import { fadeScale } from '@/motion/variants'

const tintMap = {
  blue: 'empty-icon-blue',
  teal: 'empty-icon-teal',
  purple: 'empty-icon-purple',
  green: 'empty-icon-green',
  amber: 'empty-icon-amber',
  slate: 'empty-icon-slate',
}

export default function EmptyState({ icon: Icon, title, description, action, className, compact = false, tint }) {
  return (
    <motion.div
      initial={fadeScale.initial}
      animate={fadeScale.animate}
      transition={fadeScale.animate.transition}
      className={cn(
        'flex flex-col items-center justify-center px-4 text-center gap-2 will-change-transform',
        compact ? 'py-8' : 'py-12 sm:py-16',
        className
      )}
    >
      <div className="relative">
        <motion.div
          initial={{ scale: 0.96 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.2, ease: [0.16,1,0.3,1], delay: 0.06 }}
          className={cn(
            tint ? tintMap[tint] : 'rounded-2xl bg-surface-muted flex items-center justify-center',
            compact && tint && tintMap[tint]?.replace('w-16 h-16 rounded-2xl', 'w-12 h-12 rounded-xl'),
            !tint && (compact ? 'w-12 h-12' : 'w-16 h-16'),
            !tint && 'text-foreground-muted',
            'will-change-transform'
          )}
        >
          {Icon ? (
            <Icon className={cn(compact ? 'h-6 w-6' : 'h-8 w-8', !tint && 'text-foreground-muted')} />
          ) : (
            <Inbox className={cn(compact ? 'h-6 w-6' : 'h-8 w-8', !tint && 'text-foreground-muted')} />
          )}
        </motion.div>
      </div>
      {title && <p className={cn('font-semibold text-foreground', compact ? 'text-base' : 'text-lg')}>{title}</p>}
      {description && (
        <p className={cn('text-foreground-muted max-w-sm', compact ? 'text-xs' : 'text-sm')}>{description}</p>
      )}
      {action && <div className="mt-1">{action}</div>}
    </motion.div>
  )
}
