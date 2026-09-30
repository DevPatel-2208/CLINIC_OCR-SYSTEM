import { forwardRef, useId } from 'react'
import { motion, AnimatePresence } from 'motion'
import { cn } from '@/utils/cn'

const Select = forwardRef(function Select({
  label,
  error,
  hint,
  options = [],
  className,
  id,
  size = 'md',
  ...props
}, ref) {
  const autoId = useId()
  const inputId = id || `select-${autoId}`

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-foreground-secondary">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          className={cn(
            'field-input appearance-none pr-9 text-foreground bg-surface',
            size === 'lg' ? 'px-4 py-3 text-base' : 'px-3.5 py-2.5 text-sm',
            error && 'field-error',
            className
          )}
          {...props}
        >
          <option value="">Select...</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <svg
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted"
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
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

export default Select
