import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'motion'
import { cn } from '@/utils/cn'
import { X, LogOut } from 'lucide-react'

export default function LogoutModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  className,
}) {
  const previousFocus = useRef(null)
  const modalRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return undefined
    previousFocus.current = document.activeElement
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
      previousFocus.current?.focus?.()
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return undefined
    const onKeyDown = (e) => {
      if (e.key === 'Escape' && !isLoading) onClose?.()
      if (e.key === 'Tab') {
        const nodes = modalRef.current?.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
        if (!nodes?.length) return
        const first = nodes[0]
        const last = nodes[nodes.length - 1]
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isOpen, onClose, isLoading])

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" role="presentation">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute inset-0 bg-overlay backdrop-blur-[2px]"
            onClick={() => !isLoading && onClose?.()}
            aria-hidden="true"
          />
          <motion.div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-title"
            aria-describedby="logout-desc"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              'relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-surface border border-border rounded-2xl shadow-modal p-6 sm:p-7',
              className
            )}
          >
            <button
              onClick={() => !isLoading && onClose?.()}
              disabled={isLoading}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-foreground-muted hover:text-foreground hover:bg-surface-muted transition-colors disabled:opacity-50"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-error-surface border border-error/15 text-error flex items-center justify-center mb-4">
                <LogOut className="h-5 w-5" />
              </div>
              <h3 id="logout-title" className="text-lg font-semibold text-foreground leading-snug">
                Confirm Logout
              </h3>
              <p className="text-sm font-medium text-foreground mt-1">Are you sure you want to logout?</p>
              <p id="logout-desc" className="text-sm text-foreground-muted mt-2 leading-relaxed max-w-sm">
                You will be signed out of your account and redirected to the homepage.
              </p>
              <div className="flex gap-3 justify-center w-full mt-6">
                <button
                  onClick={() => !isLoading && onClose?.()}
                  disabled={isLoading}
                  className="flex-1 sm:flex-none px-5 py-2.5 border border-border text-foreground-secondary rounded-xl hover:bg-surface-muted text-sm font-medium disabled:opacity-50 min-h-[44px] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className="flex-1 sm:flex-none px-5 py-2.5 bg-error text-white rounded-xl hover:bg-error-dark text-sm font-semibold disabled:opacity-50 min-h-[44px] shadow-sm transition-colors inline-flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
                      Logging out...
                    </>
                  ) : (
                    'Logout'
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}
