import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'motion'
import { Mail } from 'lucide-react'
import { Button, Label } from '@/components/ui'

const forgotPasswordSchema = z.object({
  email: z.string().trim().min(1, 'Email is required.').email('Enter a valid email address.'),
})

export default function ForgotPasswordForm({ onSubmit, isLoading = false, className }) {
  const form = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
    mode: 'onChange',
  })

  const handleSubmit = form.handleSubmit((data) => onSubmit({ email: data.email.trim() }))

  const emailError = form.formState.errors.email?.message

  return (
    <form onSubmit={handleSubmit} noValidate className={className}>
      <motion.div initial="initial" animate="animate" variants={{ initial: {}, animate: { transition: { staggerChildren: 0.06 } } }}>
        <motion.div variants={{ initial: { opacity: 0, y: 6 }, animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } } }} className="will-change-transform">
          <Label htmlFor="email" required>Email</Label>
          <div className="relative mt-1.5">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" aria-hidden="true" />
            <input
              id="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder="doctor@clinic.com"
              aria-invalid={!!emailError}
              aria-describedby={emailError ? 'email-error' : undefined}
              className="field-input pl-10 pr-3 py-3 text-sm"
              {...form.register('email')}
            />
          </div>
          <AnimatePresence mode="wait">
            {emailError && (
              <motion.p key="email-err" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }} id="email-error" className="mt-1.5 text-xs text-error will-change-transform">
                {emailError}
              </motion.p>
            )}
          </AnimatePresence>
          <p className="mt-1.5 text-xs text-foreground-muted">We&apos;ll send a password reset link if the account exists.</p>
        </motion.div>

        <motion.div variants={{ initial: { opacity: 0, y: 6 }, animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } } }} className="mt-6 will-change-transform">
          <Button type="submit" variant="primary" size="lg" loading={isLoading} disabled={isLoading} className="w-full">
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </Button>
        </motion.div>
      </motion.div>
    </form>
  )
}
