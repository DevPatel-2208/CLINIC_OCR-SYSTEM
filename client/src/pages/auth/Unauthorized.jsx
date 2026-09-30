import { Link } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import { motion } from "motion"
import { Button } from '@/components/ui'
import { fadeUp, fadeScale } from '@/motion/variants'

export default function Unauthorized() {
  return (
    <div className="min-h-screen bg-surface-muted flex items-center justify-center p-4">
      <motion.div initial={fadeUp.initial} animate={fadeUp.animate} transition={fadeUp.animate.transition} className="w-full max-w-md text-center will-change-transform">
        <motion.div initial={fadeScale.initial} animate={fadeScale.animate} transition={{ duration: 0.2, ease: [0.16,1,0.3,1], delay: 0.08 }} className="card-surface p-10 will-change-transform">
          <motion.div initial={{ scale: 0.96 }} animate={{ scale: 1 }} transition={{ duration: 0.2, ease: [0.16,1,0.3,1], delay: 0.12 }} className="w-16 h-16 rounded-2xl bg-error-light flex items-center justify-center mx-auto mb-6 will-change-transform">
            <ShieldAlert className="h-8 w-8 text-error" />
          </motion.div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-foreground-secondary mb-8">
            You do not have permission to view this page. Please contact your administrator if you believe this is an error.
          </p>
          <Link to="/login">
            <Button variant="primary" size="md">Return to Sign In</Button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}
