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

export default function DeleteConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  itemName = 'this item', 
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
            <div className="text-center">
              <div className="w-12 h-12 bg-error-surface rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-6 w-6 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Delete {itemName}?</h3>
              <p className="text-foreground-secondary mb-6">This action cannot be undone. All associated data will be permanently removed.</p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
                <Button variant="danger" onClick={onConfirm} disabled={isLoading}>{isLoading ? 'Deleting...' : 'Delete'}</Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
