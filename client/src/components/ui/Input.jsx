import { forwardRef, useId } from 'react'
import { motion, AnimatePresence } from 'motion'
import { cn } from '@/utils/cn'

const Input = forwardRef(function Input({
  label,
  error,
  hint,
  icon: Icon,
  className,
  id,
  size = 'md',
  ...props
}, ref) {
  const autoId = useId()
  const inputId = id || `input-${autoId}`
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined

  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-foreground-secondary"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted pointer-events-none" />
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            'field-input font-normal text-foreground placeholder:text-foreground-muted',
            'transition-[border-color,box-shadow,background-color] duration-200 ease-out',
            size === 'lg' ? 'px-4 py-3 text-base' : 'px-3.5 py-2.5 text-sm',
            Icon && 'pl-10',
            error && 'field-error',
            className
          )}
          {...props}
        />
      </div>
      <AnimatePresence mode="wait">
        {error ? (
          <motion.p
            key="error"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            id={`${inputId}-error`}
            className="text-xs font-medium text-error"
            role="alert"
          >
            {error}
          </motion.p>
        ) : hint ? (
          <p id={`${inputId}-hint`} className="text-xs text-foreground-muted">
            {hint}
          </p>
        ) : null}
      </AnimatePresence>
    </div>
  )
})

export default Input
