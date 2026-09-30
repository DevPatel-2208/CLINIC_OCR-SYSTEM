import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { cn } from '@/utils/cn'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import Label from '@/components/ui/Label'

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  specialization: z.string().optional(),
  professionalInfo: z.string().optional(),
})

export default function ProfileForm({ 
  defaultValues, 
  onSubmit, 
  isLoading = false, 
  role = 'DOCTOR',
  className,
}) {
  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      specialization: '',
      professionalInfo: '',
      ...defaultValues,
    },
    mode: 'onChange',
  })

  const handleSubmit = form.handleSubmit((data) => {
    onSubmit(data)
  })

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-4 max-w-xl', className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            {...form.register('name')}
            placeholder="Your name"
            error={form.formState.errors.name?.message}
          />
        </div>
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            {...form.register('email')}
            placeholder="your@email.com"
            error={form.formState.errors.email?.message}
            disabled
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            type="tel"
            {...form.register('phone')}
            placeholder="Phone number"
            error={form.formState.errors.phone?.message}
          />
        </div>
        {role === 'DOCTOR' && (
          <div>
            <Label htmlFor="specialization">Specialization</Label>
            <Input
              id="specialization"
              {...form.register('specialization')}
              placeholder="e.g., Cardiology"
              error={form.formState.errors.specialization?.message}
            />
          </div>
        )}
      </div>

      {role === 'DOCTOR' && (
        <div>
          <Label htmlFor="professionalInfo">Professional Info</Label>
          <Input
            id="professionalInfo"
            {...form.register('professionalInfo')}
            placeholder="Qualifications, experience, etc."
            error={form.formState.errors.professionalInfo?.message}
          />
        </div>
      )}

      <div className="pt-4 border-t">
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? 'Saving...' : 'Save Profile'}
        </Button>
      </div>
    </form>
  )
}