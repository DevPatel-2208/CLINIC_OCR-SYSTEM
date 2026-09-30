import { AlertTriangle } from 'lucide-react'
import { motion } from "motion"
import { cn } from '@/utils/cn'
import Button from '@/components/ui/Button'
import { fadeScale } from '@/motion/variants'

export default function ErrorState({ title = 'Something went wrong', message, onRetry, retryLabel = 'Try Again', className }) {
  return (
    <motion.div initial={fadeScale.initial} animate={fadeScale.animate} transition={fadeScale.animate.transition} className={cn('flex flex-col items-center justify-center py-12 sm:py-16 px-4 text-center gap-2 will-change-transform', className)}>
      <motion.div initial={{ scale: 0.96 }} animate={{ scale: 1 }} transition={{ duration: 0.2, ease: [0.16,1,0.3,1], delay: 0.06 }} className="w-14 h-14 rounded-2xl bg-error-surface flex items-center justify-center will-change-transform">
        <AlertTriangle className="h-7 w-7 text-error" />
      </motion.div>
      <h3 className="mt-2 text-lg font-semibold text-foreground">{title}</h3>
      {message && <p className="text-sm text-foreground-muted max-w-md">{message}</p>}
      {onRetry && (
        <Button variant="primary" onClick={onRetry} size="sm" className="mt-2">
          {retryLabel}
        </Button>
      )}
    </motion.div>
  )
}
