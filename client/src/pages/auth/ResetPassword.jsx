import { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Lock, ArrowLeft, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react'
import { motion, AnimatePresence } from 'motion'
import Logo from '@/components/layouts/Logo'
import ResetPasswordForm from '@/components/forms/ResetPasswordForm'
import { authApi } from '@/services'
import { fadeUp } from '@/motion/variants'

export default function ResetPassword() {
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const handleSubmit = async (data) => {
    setIsLoading(true)
    try {
      await authApi.resetPassword({ token, password: data.password })
      setSuccess(true)
      toast.success('Password reset successful')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed. Token may have expired.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="w-full max-w-md">
        <motion.div initial={fadeUp.initial} animate={fadeUp.animate} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} className="text-center mb-8 will-change-transform">
          <div className="flex justify-center mb-5"><Logo size="lg" variant="onDark" /></div>
          <h1 className="text-2xl font-bold text-white">Invalid link</h1>
          <p className="text-white/60 mt-2 text-sm">Reset token is missing or malformed.</p>
        </motion.div>
        <motion.div initial={fadeUp.initial} animate={fadeUp.animate} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1], delay: 0.08 }} className="bg-surface rounded-2xl shadow-2xl p-6 sm:p-8 text-center will-change-transform">
          <div className="w-12 h-12 rounded-full bg-error-surface border border-error/20 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-6 w-6 text-error" />
          </div>
          <p className="text-foreground-secondary text-sm">Invalid or missing reset token.</p>
          <Link to="/forgot-password" className="mt-5 inline-flex items-center justify-center px-6 py-2.5 bg-primary-800 text-white rounded-xl hover:bg-primary-900 text-sm font-medium transition-colors">
            Request a new reset link
          </Link>
        </motion.div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="w-full max-w-md">
        <motion.div initial={fadeUp.initial} animate={fadeUp.animate} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} className="text-center mb-8 will-change-transform">
          <div className="flex justify-center mb-5"><Logo size="lg" variant="onDark" /></div>
          <h1 className="text-2xl font-bold text-white">Password updated</h1>
        </motion.div>
        <motion.div initial={fadeUp.initial} animate={fadeUp.animate} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1], delay: 0.08 }} className="bg-surface rounded-2xl shadow-2xl p-8 text-center will-change-transform">
          <div className="w-14 h-14 rounded-full bg-success-surface border border-success/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-7 w-7 text-success" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Password reset complete</h2>
          <p className="text-foreground-muted text-sm mt-2">Your password has been updated successfully. You can now sign in.</p>
          <Link to="/login" className="mt-6 inline-flex items-center justify-center gap-2 w-full py-3 bg-primary-800 text-white rounded-xl hover:bg-primary-900 text-sm font-medium transition-colors">
            Go to Login
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md">
      <motion.div initial={fadeUp.initial} animate={fadeUp.animate} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} className="text-center mb-8 will-change-transform">
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }} className="flex justify-center mb-5 will-change-transform">
          <Logo size="lg" variant="onDark" />
        </motion.div>
        <motion.h1 initial={fadeUp.initial} animate={fadeUp.animate} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} className="text-2xl sm:text-3xl font-bold text-white tracking-tight will-change-transform">
          Reset password
        </motion.h1>
        <motion.p initial={fadeUp.initial} animate={fadeUp.animate} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1], delay: 0.08 }} className="text-white/60 mt-2 text-sm will-change-transform">
          Choose a strong new password
        </motion.p>
      </motion.div>

      <motion.div initial={fadeUp.initial} animate={fadeUp.animate} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1], delay: 0.08 }} className="bg-surface rounded-2xl shadow-2xl p-6 sm:p-8 will-change-transform">
        <div className="flex items-center gap-2 text-xs text-secondary-700 bg-secondary-50 border border-secondary-200 rounded-lg px-3 py-2.5 mb-6">
          <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
          Secure reset — token validated
        </div>
        <ResetPasswordForm onSubmit={handleSubmit} isLoading={isLoading} />
        <p className="text-center text-sm mt-6">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-primary-700 hover:text-primary-900 dark:text-primary-600 font-medium transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to login
          </Link>
        </p>
      </motion.div>

      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: 0.3 }} className="text-center mt-6 text-xs text-primary-100/70 will-change-transform">
        Protected &amp; HIPAA-conscious.
      </motion.p>
    </div>
  )
}
