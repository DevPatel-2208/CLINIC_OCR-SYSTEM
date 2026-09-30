import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'motion'
import { Lock, Eye, EyeOff } from 'lucide-react'
import { Button, Label } from '@/components/ui'

const resetPasswordSchema = z
  .object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export default function ResetPasswordForm({ onSubmit, isLoading = false, className }) {
  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const form = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
    mode: 'onChange',
  })

  const handleSubmit = form.handleSubmit((data) => onSubmit({ password: data.password }))

  const pwError = form.formState.errors.password?.message
  const confirmError = form.formState.errors.confirmPassword?.message

  return (
    <form onSubmit={handleSubmit} noValidate className={className}>
      <motion.div initial="initial" animate="animate" variants={{ initial: {}, animate: { transition: { staggerChildren: 0.06 } } }} className="space-y-5">
        <motion.div variants={{ initial: { opacity: 0, y: 6 }, animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } } }} className="will-change-transform">
          <Label htmlFor="password" required>New password</Label>
          <div className="relative mt-1.5">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" aria-hidden="true" />
            <input
              id="password"
              type={showPw ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="••••••••"
              aria-invalid={!!pwError}
              aria-describedby={pwError ? 'password-error' : undefined}
              className="field-input pl-10 pr-11 py-3 text-sm"
              {...form.register('password')}
            />
            <button type="button" onClick={() => setShowPw((s) => !s)} aria-label={showPw ? 'Hide password' : 'Show password'} className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-foreground-muted hover:text-foreground hover:bg-surface-muted transition-colors" tabIndex={-1}>
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <AnimatePresence mode="wait">
            {pwError && (
              <motion.p key="pw-err" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }} id="password-error" className="mt-1.5 text-xs text-error will-change-transform">
                {pwError}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div variants={{ initial: { opacity: 0, y: 6 }, animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } } }} className="will-change-transform">
          <Label htmlFor="confirmPassword" required>Confirm password</Label>
          <div className="relative mt-1.5">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" aria-hidden="true" />
            <input
              id="confirmPassword"
              type={showConfirm ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="••••••••"
              aria-invalid={!!confirmError}
              aria-describedby={confirmError ? 'confirm-error' : undefined}
              className="field-input pl-10 pr-11 py-3 text-sm"
              {...form.register('confirmPassword')}
            />
            <button type="button" onClick={() => setShowConfirm((s) => !s)} aria-label={showConfirm ? 'Hide password' : 'Show password'} className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-foreground-muted hover:text-foreground hover:bg-surface-muted transition-colors" tabIndex={-1}>
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <AnimatePresence mode="wait">
            {confirmError && (
              <motion.p key="confirm-err" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }} id="confirm-error" className="mt-1.5 text-xs text-error will-change-transform">
                {confirmError}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div variants={{ initial: { opacity: 0, y: 6 }, animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } } }} className="will-change-transform">
          <Button type="submit" variant="primary" size="lg" loading={isLoading} disabled={isLoading} className="w-full">
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </Button>
        </motion.div>
      </motion.div>
    </form>
  )
}
