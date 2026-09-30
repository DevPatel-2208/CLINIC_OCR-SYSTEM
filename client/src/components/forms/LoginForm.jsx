import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { cn } from '@/utils/cn'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Label from '@/components/ui/Label'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export default function LoginForm({ 
  onSubmit, 
  isLoading = false, 
  className,
  onForgotPassword,
}) {
  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onChange',
  })

  const handleSubmit = form.handleSubmit((data) => {
    onSubmit(data)
  })

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-4', className)}>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          {...form.register('email')}
          placeholder="doctor@clinic.com"
          error={form.formState.errors.email?.message}
          autoComplete="email"
        />
      </div>
      <div>
        <div className="flex items-center justify-between mb-1">
          <Label htmlFor="password">Password</Label>
          {onForgotPassword && (
            <a href="#" onClick={(e) => { e.preventDefault(); onForgotPassword() }} className="text-sm text-primary-600 hover:underline">
              Forgot password?
            </a>
          )}
        </div>
        <Input
          id="password"
          type="password"
          {...form.register('password')}
          placeholder="••••••••"
          error={form.formState.errors.password?.message}
          autoComplete="current-password"
        />
      </div>

      <Button type="submit" disabled={isLoading} className="w-full py-2.5">
        {isLoading ? 'Signing in...' : 'Sign In'}
      </Button>
    </form>
  )
}