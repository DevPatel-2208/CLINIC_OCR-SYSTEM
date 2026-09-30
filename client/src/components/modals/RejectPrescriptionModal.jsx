import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion'
import { cn } from '@/utils/cn'
import { X } from 'lucide-react'
import Button from '@/components/ui/Button'
import Textarea from '@/components/ui/Textarea'
import Label from '@/components/ui/Label'

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

export default function RejectPrescriptionModal({ 
  isOpen, 
  onClose, 
  onReject, 
  prescriptionId,
  isLoading = false,
  className,
}) {
  const [reason, setReason] = useState('')
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

  const handleSubmit = (e) => {
    e.preventDefault()
    onReject(reason)
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
            <h3 className="text-lg font-semibold text-foreground mb-2">Reject Prescription</h3>
            <p className="text-foreground-secondary mb-4">Please provide a reason for rejecting this prescription.</p>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <Label htmlFor="rejectReason">Reason for Rejection *</Label>
                <Textarea id="rejectReason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Enter reason..." rows={4} required className="mt-1" />
              </div>
              <div className="flex gap-3 justify-end">
                <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
                <Button type="submit" variant="danger" disabled={isLoading || !reason.trim()}>{isLoading ? 'Rejecting...' : 'Reject Prescription'}</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
