import { useState } from 'react'
import { motion, AnimatePresence } from 'motion'
import { cn } from '@/utils/cn'

const positionClasses = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
}

const tooltipVariants = {
  hidden: { opacity: 0, y: 4 },
  visible: { opacity: 1, y: 0 },
}

export default function Tooltip({
  content,
  children,
  position = 'top',
}) {
  const [visible, setVisible] = useState(false)

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      <AnimatePresence>
        {visible && (
          <motion.div
            variants={tooltipVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.13, ease: 'easeOut' }}
            className={cn(
              'absolute z-50 px-2 py-1 text-xs font-medium rounded shadow-sm whitespace-nowrap pointer-events-none',
              'bg-surface-elevated text-foreground border border-border',
              positionClasses[position]
            )}
            role="tooltip"
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
