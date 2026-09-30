import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion'
import { cn } from '@/utils/cn'

const dropdownVariants = {
  hidden: { opacity: 0, scale: 0.98, y: -4 },
  visible: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.98, y: -4 },
}

export default function Dropdown({
  trigger,
  items = [],
  align = 'left',
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef()

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={ref} className="relative inline-block">
      <div onClick={() => setOpen((prev) => !prev)} className="cursor-pointer">
        {trigger}
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={cn(
              'absolute z-50 mt-1 min-w-[180px] rounded-lg shadow-dropdown py-1.5',
              'bg-surface-elevated border border-border',
              align === 'right' ? 'right-0' : 'left-0'
            )}
          >
            {items.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  item.onClick?.()
                  setOpen(false)
                }}
                className={cn(
                  'flex items-center gap-2 w-full px-3 py-2 text-sm transition-colors',
                  item.danger
                    ? 'text-error hover:bg-error-surface'
                    : 'text-foreground-secondary hover:bg-surface-muted'
                )}
              >
                {item.icon && <item.icon className="h-4 w-4" />}
                {item.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
