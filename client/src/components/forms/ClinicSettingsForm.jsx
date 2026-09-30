import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { cn } from '@/utils/cn'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Button from '@/components/ui/Button'
import Label from '@/components/ui/Label'

const clinicSettingsSchema = z.object({
  name: z.string().optional(),
  logo: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  settings: z.object({
    reportHeader: z.string().optional(),
    reportFooter: z.string().optional(),
    timezone: z.string().optional(),
    dateFormat: z.string().optional(),
  }).optional(),
})

export default function ClinicSettingsForm({ 
  defaultValues, 
  onSubmit, 
  isLoading = false, 
  className,
}) {
  const form = useForm({
    resolver: zodResolver(clinicSettingsSchema),
    defaultValues: {
      name: '',
      logo: '',
      address: '',
      phone: '',
      email: '',
      settings: {
        reportHeader: '',
        reportFooter: '',
        timezone: 'UTC',
        dateFormat: 'DD/MM/YYYY',
      },
      ...defaultValues,
    },
    mode: 'onChange',
  })

  const handleSubmit = form.handleSubmit((data) => {
    onSubmit(data)
  })

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-6', className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Clinic Name</Label>
          <Input
            id="name"
            {...form.register('name')}
            placeholder="Clinic name"
            error={form.formState.errors.name?.message}
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            type="tel"
            {...form.register('phone')}
            placeholder="Clinic phone"
            error={form.formState.errors.phone?.message}
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            {...form.register('email')}
            placeholder="clinic@email.com"
            error={form.formState.errors.email?.message}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          {...form.register('address')}
          placeholder="Clinic address"
          rows={2}
          error={form.formState.errors.address?.message}
        />
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Report Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="reportHeader">Report Header</Label>
            <Textarea
              id="reportHeader"
              {...form.register('settings.reportHeader')}
              placeholder="Header text for PDF reports"
              rows={2}
            />
          </div>
          <div>
            <Label htmlFor="reportFooter">Report Footer</Label>
            <Textarea
              id="reportFooter"
              {...form.register('settings.reportFooter')}
              placeholder="Footer text for PDF reports"
              rows={2}
            />
          </div>
          <div>
            <Label htmlFor="timezone">Timezone</Label>
            <Input
              id="timezone"
              {...form.register('settings.timezone')}
              placeholder="UTC"
            />
          </div>
          <div>
            <Label htmlFor="dateFormat">Date Format</Label>
            <Input
              id="dateFormat"
              {...form.register('settings.dateFormat')}
              placeholder="DD/MM/YYYY"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t">
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </form>
  )
}