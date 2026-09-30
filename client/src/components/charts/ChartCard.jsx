import { cn } from '@/utils/cn'
import { motion } from 'motion'
import { fadeScale } from '@/motion/variants'

export default function ChartCard({ title, description, children, className, filter }) {
  return (
    <motion.div
      variants={fadeScale}
      initial="initial"
      animate="animate"
      className={cn('bg-surface rounded-xl border border-border shadow-sm p-5 will-change-transform', className)}
      style={{ transform: 'translateZ(0)' }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
          {description && (
            <p className="text-sm text-foreground-muted mt-0.5">{description}</p>
          )}
        </div>
        {filter && <div className="flex-shrink-0">{filter}</div>}
      </div>
      <div className="w-full">{children}</div>
    </motion.div>
  )
}
