import { forwardRef, useId } from 'react'
import { motion, AnimatePresence } from 'motion'
import { cn } from '@/utils/cn'

const Textarea = forwardRef(function Textarea({
  label,
  error,
  hint,
  className,
  id,
  rows = 4,
  ...props
}, ref) {
  const autoId = useId()
  const inputId = id || `textarea-${autoId}`

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-foreground-secondary">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={inputId}
        rows={rows}
        aria-invalid={error ? true : undefined}
        className={cn(
          'field-input px-3.5 py-2.5 text-sm resize-y',
          error && 'field-error',
          className
        )}
        {...props}
      />
      <AnimatePresence mode="wait">
        {error ? (
          <motion.p
            key="error"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="text-xs font-medium text-error"
            role="alert"
          >
            {error}
          </motion.p>
        ) : hint ? (
          <p className="text-xs text-foreground-muted">{hint}</p>
        ) : null}
      </AnimatePresence>
    </div>
  )
})

export default Textarea
