import { Link } from 'react-router-dom'
import { FileQuestion } from 'lucide-react'
import { motion } from "motion"
import { Button } from '@/components/ui'
import { fadeUp, fadeScale } from '@/motion/variants'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div initial={fadeUp.initial} animate={fadeUp.animate} transition={fadeUp.animate.transition} className="w-full max-w-md text-center will-change-transform">
        <motion.div initial={fadeScale.initial} animate={fadeScale.animate} transition={{ duration: 0.25, ease: [0.16,1,0.3,1], delay: 0.08 }} className="card-surface p-10 sm:p-12 will-change-transform">
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ duration: 0.3, ease: [0.16,1,0.3,1], delay: 0.12 }} className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-50/20 dark:to-secondary-50/20 flex items-center justify-center mx-auto mb-6 ring-2 ring-border will-change-transform">
            <FileQuestion className="h-8 w-8 text-primary-700 dark:text-primary-300" />
          </motion.div>
          <p className="text-6xl font-bold text-foreground-subtle mb-2 counter-value">404</p>
          <h1 className="text-2xl font-bold text-foreground mb-2">Page Not Found</h1>
          <p className="text-foreground-secondary mb-8 text-sm">
            The page you are looking for does not exist or has been moved.
          </p>
          <Link to="/">
            <Button variant="primary" size="md">Return Home</Button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}
