import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { cn } from '@/utils/cn'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Textarea from '@/components/ui/Textarea'
import Button from '@/components/ui/Button'
import Label from '@/components/ui/Label'

const patientSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Phone number is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  dateOfBirth: z.string().optional(),
  age: z.number().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  address: z.string().optional(),
  bloodGroup: z.string().optional(),
  assignedDoctor: z.string().optional(),
  medicalHistory: z.string().optional(),
  allergies: z.array(z.string()).optional(),
})

export default function PatientForm({ 
  defaultValues, 
  onSubmit, 
  isLoading = false, 
  submitLabel = 'Save Patient',
  className,
  onCancel,
}) {
  const form = useForm({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      dateOfBirth: '',
      age: '',
      gender: '',
      address: '',
      bloodGroup: '',
      assignedDoctor: '',
      medicalHistory: '',
      allergies: [],
      ...defaultValues,
    },
    mode: 'onChange',
  })

  const [allergies, setAllergies] = useState(defaultValues?.allergies || [])
  const [newAllergy, setNewAllergy] = useState('')

  const handleSubmit = form.handleSubmit((data) => {
    onSubmit({ ...data, allergies })
  })

  const addAllergy = () => {
    if (newAllergy.trim() && !allergies.includes(newAllergy.trim())) {
      setAllergies([...allergies, newAllergy.trim()])
      setNewAllergy('')
    }
  }

  const removeAllergy = (allergy) => {
    setAllergies(allergies.filter((a) => a !== allergy))
  }

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-4', className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            {...form.register('name')}
            placeholder="Patient name"
            error={form.formState.errors.name?.message}
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone *</Label>
          <Input
            id="phone"
            type="tel"
            {...form.register('phone')}
            placeholder="Phone number"
            error={form.formState.errors.phone?.message}
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            {...form.register('email')}
            placeholder="email@example.com"
            error={form.formState.errors.email?.message}
          />
        </div>
        <div>
          <Label htmlFor="dateOfBirth">Date of Birth</Label>
          <Input
            id="dateOfBirth"
            type="date"
            {...form.register('dateOfBirth')}
            error={form.formState.errors.dateOfBirth?.message}
          />
        </div>
        <div>
          <Label htmlFor="age">Age</Label>
          <Input
            id="age"
            type="number"
            {...form.register('age', { valueAsNumber: true })}
            placeholder="Age"
            error={form.formState.errors.age?.message}
          />
        </div>
        <div>
          <Label htmlFor="gender">Gender</Label>
          <Select
            id="gender"
            {...form.register('gender')}
            options={[
              { value: 'MALE', label: 'Male' },
              { value: 'FEMALE', label: 'Female' },
              { value: 'OTHER', label: 'Other' },
            ]}
            placeholder="Select gender"
            error={form.formState.errors.gender?.message}
          />
        </div>
        <div>
          <Label htmlFor="bloodGroup">Blood Group</Label>
          <Input
            id="bloodGroup"
            {...form.register('bloodGroup')}
            placeholder="e.g., A+, O-"
            error={form.formState.errors.bloodGroup?.message}
          />
        </div>
        <div>
          <Label htmlFor="assignedDoctor">Assigned Doctor</Label>
          <Select
            id="assignedDoctor"
            {...form.register('assignedDoctor')}
            options={[]}
            placeholder="Select doctor"
            error={form.formState.errors.assignedDoctor?.message}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          {...form.register('address')}
          placeholder="Patient address"
          rows={2}
          error={form.formState.errors.address?.message}
        />
      </div>

      <div>
        <Label htmlFor="medicalHistory">Medical History</Label>
        <Textarea
          id="medicalHistory"
          {...form.register('medicalHistory')}
          placeholder="Previous conditions, surgeries, etc."
          rows={3}
          error={form.formState.errors.medicalHistory?.message}
        />
      </div>

      <div>
        <Label>Allergies</Label>
        <div className="flex gap-2 mb-2">
          <Input
            value={newAllergy}
            onChange={(e) => setNewAllergy(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAllergy())}
            placeholder="Add allergy (press Enter)"
            className="flex-1"
          />
          <Button type="button" variant="outline" size="sm" onClick={addAllergy}>
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {allergies.map((allergy, i) => (
            <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-warning-surface text-warning text-sm rounded">
              {allergy}
              <button
                type="button"
                onClick={() => removeAllergy(allergy)}
                className="ml-1 hover:text-warning-dark"
                aria-label={`Remove ${allergy}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
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