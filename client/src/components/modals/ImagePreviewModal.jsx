import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion'
import { cn } from '@/utils/cn'
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

export default function ImagePreviewModal({ 
  isOpen, 
  onClose, 
  src, 
  alt = 'Preview', 
  title,
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
      {isOpen && src && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute inset-0 bg-black/90"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            initial={{ opacity: 0, scale: isMobile ? 1 : 0.96, y: isMobile ? '100%' : 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: isMobile ? 1 : 0.96, y: isMobile ? '100%' : 8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={cn('relative max-w-4xl w-full max-h-[100vh] sm:max-h-[90vh]', className)}
            role="dialog"
            aria-modal="true"
          >
            <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 text-white/70 hover:text-white rounded-lg hover:bg-white/10" aria-label="Close"><X className="h-6 w-6" /></button>
            {title && <div className="absolute top-4 left-4 z-10 text-white text-lg font-medium">{title}</div>}
            <img src={src} alt={alt} className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
