import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { cn } from '@/utils/cn'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import Label from '@/components/ui/Label'

const doctorSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
  specialization: z.string().optional(),
  professionalInfo: z.string().optional(),
})

export default function DoctorForm({ 
  defaultValues, 
  onSubmit, 
  isLoading = false, 
  submitLabel = 'Add Doctor',
  className,
  onCancel,
  isEditing = false,
}) {
  const schema = isEditing ? doctorSchema.partial() : doctorSchema

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
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
    <form onSubmit={handleSubmit} className={cn('space-y-4', className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            {...form.register('name')}
            placeholder="Doctor name"
            error={form.formState.errors.name?.message}
          />
        </div>
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            {...form.register('email')}
            placeholder="doctor@clinic.com"
            error={form.formState.errors.email?.message}
            disabled={isEditing}
          />
        </div>
        <div>
          <Label htmlFor="password">{isEditing ? 'Password (leave blank to keep current)' : 'Password *'} </Label>
          <Input
            id="password"
            type="password"
            {...form.register('password')}
            placeholder={isEditing ? '••••••••' : 'Enter password'}
            error={form.formState.errors.password?.message}
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
        <div>
          <Label htmlFor="specialization">Specialization</Label>
          <Input
            id="specialization"
            {...form.register('specialization')}
            placeholder="e.g., Cardiology, Pediatrics"
            error={form.formState.errors.specialization?.message}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="professionalInfo">Professional Info</Label>
        <Input
          id="professionalInfo"
          {...form.register('professionalInfo')}
          placeholder="Additional qualifications, experience, etc."
          error={form.formState.errors.professionalInfo?.message}
        />
      </div>

      <div className="flex gap-3 pt-4 border-t">
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? 'Saving...' : submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}