import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { cn } from '@/utils/cn'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Textarea from '@/components/ui/Textarea'
import Button from '@/components/ui/Button'
import Label from '@/components/ui/Label'

const followUpSchema = z.object({
  patientId: z.string().min(1, 'Patient ID is required'),
  date: z.string().min(1, 'Date is required'),
  reason: z.string().optional(),
  notes: z.string().optional(),
  prescriptionId: z.string().optional(),
})

export default function FollowUpForm({ 
  defaultValues, 
  onSubmit, 
  isLoading = false, 
  submitLabel = 'Create Follow-up',
  className,
  onCancel,
}) {
  const form = useForm({
    resolver: zodResolver(followUpSchema),
    defaultValues: {
      patientId: '',
      date: '',
      reason: '',
      notes: '',
      prescriptionId: '',
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
          <Label htmlFor="patientId">Patient ID *</Label>
          <Input
            id="patientId"
            {...form.register('patientId')}
            placeholder="Enter patient ID"
            error={form.formState.errors.patientId?.message}
          />
        </div>
        <div>
          <Label htmlFor="date">Date *</Label>
          <Input
            id="date"
            type="datetime-local"
            {...form.register('date')}
            error={form.formState.errors.date?.message}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="prescriptionId">Prescription (Optional)</Label>
          <Input
            id="prescriptionId"
            {...form.register('prescriptionId')}
            placeholder="Prescription ID"
            error={form.formState.errors.prescriptionId?.message}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="reason">Reason</Label>
        <Input
          id="reason"
          {...form.register('reason')}
          placeholder="Reason for follow-up"
          error={form.formState.errors.reason?.message}
        />
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          {...form.register('notes')}
          placeholder="Additional notes"
          rows={3}
          error={form.formState.errors.notes?.message}
        />
      </div>

      <div className="flex gap-3 pt-4 border-t">
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? 'Creating...' : submitLabel}
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