import { motion, AnimatePresence } from 'motion'
import { cn } from '@/utils/cn'

export default function Checkbox({
  label,
  checked,
  onChange,
  disabled = false,
  id,
  className,
  error,
}) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="space-y-1">
      <label
        htmlFor={inputId}
        className={cn(
          'inline-flex items-center gap-2 cursor-pointer',
          disabled && 'cursor-not-allowed opacity-50'
        )}
      >
        <input
          id={inputId}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          className={cn(
            'h-4 w-4 rounded border-border text-primary-600 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-surface bg-surface',
            'transition-[border-color,box-shadow,background-color] duration-150 ease-out',
            error && 'border-error',
            className
          )}
        />
        {label && <span className="text-sm text-foreground-secondary">{label}</span>}
      </label>
      <AnimatePresence mode="wait">
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="text-xs font-medium text-error"
            role="alert"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
