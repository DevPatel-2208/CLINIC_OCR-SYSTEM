import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'motion'
import { X } from 'lucide-react'
import { cn } from '@/utils/cn'

const sizeClasses = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-md',
  lg: 'sm:max-w-lg',
  xl: 'sm:max-w-2xl',
  full: 'sm:max-w-full',
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const m = window.matchMedia('(max-width: 639px)')
    const handler = () => setIsMobile(m.matches)
    handler()
    m.addEventListener('change', handler)
    return () => m.removeEventListener('change', handler)
  }, [])
  return isMobile
}

export default function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  hideClose = false,
}) {
  const previousFocus = useRef(null)
  const modalRef = useRef(null)
  const overlayRef = useRef(null)
  const isMobile = useIsMobile()

  useEffect(() => {
    if (!open) return undefined
    previousFocus.current = document.activeElement
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
      previousFocus.current?.focus?.()
    }
  }, [open])

  useEffect(() => {
    if (!open) return undefined
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.()
      if (e.key === 'Tab') {
        const focusables = modalRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        if (!focusables?.length) return
        const first = focusables[0]
        const last = focusables[focusables.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  return createPortal(
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
          role="presentation"
        >
          <motion.div
            ref={overlayRef}
            onClick={(e) => e.target === overlayRef.current && onClose?.()}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute inset-0 bg-overlay backdrop-blur-[2px]"
            aria-hidden="true"
          />
          <motion.div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'dialog-title' : undefined}
            aria-describedby={description ? 'dialog-desc' : undefined}
            initial={{ opacity: 0, scale: isMobile ? 1 : 0.96, y: isMobile ? '100%' : 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: isMobile ? 1 : 0.96, y: isMobile ? '100%' : 8 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              'relative w-full flex flex-col max-h-[92vh] sm:max-h-[85vh] rounded-t-2xl sm:rounded-xl shadow-modal sm:mx-4',
              'bg-surface border border-border',
              sizeClasses[size]
            )}
          >
            {(title || !hideClose) && (
              <div className="flex items-start justify-between gap-4 px-5 sm:px-6 py-4 border-b border-border shrink-0">
                <div className="min-w-0">
                  {title && (
                    <h2 id="dialog-title" className="text-lg font-semibold text-foreground leading-snug">
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p id="dialog-desc" className="text-sm text-foreground-muted mt-0.5">
                      {description}
                    </p>
                  )}
                </div>
                {!hideClose && (
                  <button
                    onClick={onClose}
                    aria-label="Close dialog"
                    className="shrink-0 -mr-1 p-1.5 text-foreground-muted hover:text-foreground rounded-lg hover:bg-surface-muted transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            )}
            <div className="px-5 sm:px-6 py-4 overflow-y-auto flex-1">{children}</div>
            {footer && (
              <div className="flex items-center justify-end gap-3 px-5 sm:px-6 py-4 border-t border-border shrink-0">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}
