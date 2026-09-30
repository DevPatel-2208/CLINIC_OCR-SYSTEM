import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Mail, ArrowLeft, Info, ShieldCheck } from 'lucide-react'
import { motion, AnimatePresence } from 'motion'
import Logo from '@/components/layouts/Logo'
import ForgotPasswordForm from '@/components/forms/ForgotPasswordForm'
import { authApi } from '@/services'
import { fadeUp, staggerContainer, staggerItem } from '@/motion/variants'

export default function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (data) => {
    setIsLoading(true)
    setSubmitError('')
    try {
      await authApi.forgotPassword(data)
      toast.success('If the email exists, a reset link has been sent')
      navigate('/login')
    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong. Please try again.'
      setSubmitError(msg)
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      <motion.div initial={fadeUp.initial} animate={fadeUp.animate} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} className="text-center mb-8 will-change-transform">
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }} className="flex justify-center mb-5 will-change-transform">
          <Logo size="lg" variant="onDark" />
        </motion.div>
        <motion.h1 initial={fadeUp.initial} animate={fadeUp.animate} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} className="text-2xl sm:text-3xl font-bold text-white tracking-tight will-change-transform">
          Forgot password
        </motion.h1>
        <motion.p initial={fadeUp.initial} animate={fadeUp.animate} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1], delay: 0.08 }} className="text-white/60 mt-2 text-sm will-change-transform">
          Enter your email and we&apos;ll send you a reset link
        </motion.p>
      </motion.div>

      <motion.div initial={fadeUp.initial} animate={fadeUp.animate} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1], delay: 0.08 }} className="bg-surface rounded-2xl shadow-2xl p-6 sm:p-8 will-change-transform">
        <AnimatePresence mode="wait">
          {submitError && (
            <motion.div key="submitError" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15, ease: 'easeOut' }} className="flex items-start gap-2.5 rounded-lg border border-error/25 bg-error-surface p-3 text-sm mb-5 will-change-transform" role="alert">
              <Info className="h-4 w-4 mt-0.5 shrink-0 text-error" aria-hidden="true" />
              <p className="text-error leading-relaxed">{submitError}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <ForgotPasswordForm onSubmit={handleSubmit} isLoading={isLoading} />

        <div className="mt-6 flex items-center gap-3 text-[11px] text-foreground-muted">
          <div className="h-px flex-1 bg-border-subtle" />
          <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3 w-3" /> Secure reset</span>
          <div className="h-px flex-1 bg-border-subtle" />
        </div>

        <p className="text-center text-sm mt-6">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-primary-700 hover:text-primary-900 dark:text-primary-600 dark:hover:text-primary-700 font-medium transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to login
          </Link>
        </p>
      </motion.div>

      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: 0.3 }} className="text-center mt-6 text-xs text-primary-100/70 will-change-transform">
        Protected &amp; HIPAA-conscious. AI-Powered Medical Document Intelligence.
      </motion.p>
    </div>
  )
}
