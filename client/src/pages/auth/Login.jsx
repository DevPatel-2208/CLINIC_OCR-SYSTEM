import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Eye, EyeOff, Mail, Lock, Info } from 'lucide-react'
import { motion, AnimatePresence } from "motion"
import useAuthStore from '@/store/authStore'
import { Button, Label, Badge } from '@/components/ui'
import Logo from '@/components/layouts/Logo'
import { fadeUp, staggerContainer, staggerItem } from '@/motion/variants'

const ROLE_HOME = {
  ADMIN: '/admin/dashboard',
  DOCTOR: '/doctor/dashboard',
  RECEPTIONIST: '/receptionist/dashboard',
  PATIENT: '/patient/dashboard',
}

const DEMO_ACCOUNTS = [
  { role: 'Admin', email: 'admin@clinic.com', color: 'info' },
  { role: 'Doctor', email: 'doctor@clinic.com', color: 'success' },
  { role: 'Receptionist', email: 'staff@clinic.com', color: 'warning' },
  { role: 'Patient', email: 'patient@clinic.com', color: 'default' },
]

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function mapApiError(err) {
  const status = err?.response?.status
  if (status === 401) return 'Incorrect email or password. Please try again.'
  if (status === 403) return 'Your account is inactive. Please contact your administrator.'
  if (status === 429) return 'Too many sign-in attempts. Please wait a moment and try again.'
  if (status === 500 || !status) return 'Unable to connect to the clinic server. Please try again.'
  return err?.response?.data?.message || 'Unable to sign in. Please try again.'
}

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({ email: '', password: '' })
  const [submitError, setSubmitError] = useState('')
  const login = useAuthStore((s) => s.login)
  const loading = useAuthStore((s) => s.loading)
  const navigate = useNavigate()

  const validate = () => {
    const errors = { email: '', password: '' }
    if (!email.trim()) errors.email = 'Email is required.'
    else if (!EMAIL_RE.test(email.trim())) errors.email = 'Enter a valid email address.'
    if (!password) errors.password = 'Password is required.'
    setFieldErrors(errors)
    setSubmitError('')
    return !errors.email && !errors.password
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (loading) return
    if (!validate()) return
    try {
      const user = await login(email.trim(), password)
      navigate(ROLE_HOME[user.role] || '/doctor/dashboard')
      toast.success(`Welcome back, ${user.name}`)
    } catch (err) {
      setSubmitError(mapApiError(err))
    }
  }

  return (
    <div className="w-full max-w-md">
      <motion.div initial={fadeUp.initial} animate={fadeUp.animate} transition={{ duration: 0.3, ease: [0.16,1,0.3,1], delay: 0 }} className="text-center mb-8 will-change-transform">
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.25, ease: [0.16,1,0.3,1] }} className="flex justify-center mb-5 will-change-transform">
          <Logo size="lg" variant="onDark" />
        </motion.div>
        <motion.h1 initial={fadeUp.initial} animate={fadeUp.animate} transition={{ duration: 0.3, ease: [0.16,1,0.3,1], delay: 0 }} className="text-2xl sm:text-3xl font-bold text-white tracking-tight will-change-transform">Welcome back</motion.h1>
        <motion.p initial={fadeUp.initial} animate={fadeUp.animate} transition={{ duration: 0.3, ease: [0.16,1,0.3,1], delay: 0.08 }} className="text-white/60 mt-2 text-sm will-change-transform">Sign in to your clinic workspace</motion.p>
      </motion.div>

      <motion.div initial={fadeUp.initial} animate={fadeUp.animate} transition={{ duration: 0.3, ease: [0.16,1,0.3,1], delay: 0.08 }} className="bg-surface rounded-2xl shadow-2xl p-6 sm:p-8 will-change-transform">
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <AnimatePresence mode="wait">
            {submitError && (
              <motion.div
                key="submitError"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="flex items-start gap-2.5 rounded-lg border border-error/25 bg-error-surface p-3 text-sm will-change-transform"
                role="alert"
              >
                <Info className="h-4 w-4 mt-0.5 shrink-0 text-error" aria-hidden="true" />
                <p className="text-error">{submitError}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div variants={staggerContainer(0.06)} initial="initial" animate="animate">
            <motion.div variants={staggerItem} className="will-change-transform">
              <Label htmlFor="email" required>Email</Label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" aria-hidden="true" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: '' })) }}
                  placeholder="doctor@clinic.com"
                  aria-invalid={!!fieldErrors.email}
                  aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                  className="field-input pl-10 pr-3 py-3 text-sm transition-[border-color,box-shadow] duration-150"
                  autoFocus
                />
              </div>
              <AnimatePresence mode="wait">
                {fieldErrors.email && (
                  <motion.p key="email-err" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }} id="email-error" className="mt-1.5 text-xs text-error will-change-transform">{fieldErrors.email}</motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div variants={staggerItem} className="mt-5 will-change-transform">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" required>Password</Label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-primary-700 hover:text-primary-900 dark:text-primary-700 dark:hover:text-primary-800 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative mt-1.5">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" aria-hidden="true" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: '' })) }}
                  placeholder="Enter your password"
                  aria-invalid={!!fieldErrors.password}
                  aria-describedby={fieldErrors.password ? 'password-error' : undefined}
                  className="field-input pl-10 pr-11 py-3 text-sm transition-[border-color,box-shadow] duration-150"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-foreground-muted hover:text-foreground hover:bg-surface-muted transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <AnimatePresence mode="wait">
                {fieldErrors.password && (
                  <motion.p key="pw-err" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }} id="password-error" className="mt-1.5 text-xs text-error will-change-transform">{fieldErrors.password}</motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div variants={staggerItem} className="mt-5 will-change-transform">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </motion.div>
          </motion.div>
        </form>

        <motion.div initial={fadeUp.initial} animate={fadeUp.animate} transition={{ duration: 0.3, ease: [0.16,1,0.3,1], delay: 0.22 }} className="mt-6 rounded-xl border border-border-subtle bg-surface-muted/60 p-4 will-change-transform">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-foreground-muted mb-3">
            <Info className="h-3.5 w-3.5" aria-hidden="true" />
            Demo credentials
          </p>
          <ul className="space-y-2">
            {DEMO_ACCOUNTS.map((acc) => (
              <li key={acc.role} className="flex items-center justify-between gap-2 text-xs">
                <Badge variant={acc.color}>{acc.role}</Badge>
                <span className="text-foreground-secondary font-mono">{acc.email}</span>
                <span className="text-foreground-muted font-mono">password123</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </motion.div>

      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: 0.3 }} className="text-center mt-6 text-xs text-primary-100/70 will-change-transform">
        Protected &amp; HIPAA-conscious. AI-Powered Medical Document Intelligence.
      </motion.p>
    </div>
  )
}
