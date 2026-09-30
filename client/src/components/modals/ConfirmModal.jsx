import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion'
import { cn } from '@/utils/cn'
import Button from '@/components/ui/Button'
import { X } from 'lucide-react'

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const m = window.matchMedia('(max-width: 639px)')
    const h = () => setIsMobile(m.matches)
    h()
    m.addEventListener('change', h)
    return () => m.removeEventListener('change', h)
  }, [])
  return isMobile
}

export default function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Confirm', 
  message = 'Are you sure?', 
  confirmLabel = 'Confirm', 
  cancelLabel = 'Cancel',
  variant = 'danger',
  isLoading = false,
  className,
}) {
  const isMobile = useIsMobile()
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  const variantClasses = {
    danger: 'bg-error text-white hover:bg-error-dark',
    primary: 'bg-primary text-white hover:bg-primary-hover dark:bg-primary dark:hover:bg-primary-hover',
    warning: 'bg-warning text-white hover:bg-warning-dark',
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2, ease: 'easeOut' }} className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
          <motion.div
            initial={{ opacity: 0, scale: isMobile ? 1 : 0.96, y: isMobile ? '100%' : 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: isMobile ? 1 : 0.96, y: isMobile ? '100%' : 8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={cn('relative bg-surface rounded-t-xl sm:rounded-xl shadow-xl max-w-md w-full p-6', className)}
            role="dialog"
            aria-modal="true"
          >
            <button onClick={onClose} className="absolute top-4 right-4 p-1 text-foreground-muted hover:text-foreground-secondary rounded-lg hover:bg-surface-muted" aria-label="Close"><X className="h-5 w-5" /></button>
            <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
            <p className="text-foreground-secondary mb-6">{message}</p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={onClose} disabled={isLoading}>{cancelLabel}</Button>
              <Button variant={variant} onClick={onConfirm} disabled={isLoading} className={variantClasses[variant]}>{isLoading ? 'Processing...' : confirmLabel}</Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
