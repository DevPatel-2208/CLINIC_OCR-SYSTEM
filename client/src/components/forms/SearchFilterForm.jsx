import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { cn } from '@/utils/cn'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Textarea from '@/components/ui/Textarea'
import Button from '@/components/ui/Button'
import Label from '@/components/ui/Label'

const searchFilterSchema = z.object({
  q: z.string().optional(),
  type: z.enum(['all', 'patients', 'prescriptions', 'medicines', 'documents']).optional(),
  patientId: z.string().optional(),
  doctorId: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  status: z.string().optional(),
})

export default function SearchFilterForm({ 
  onSearch, 
  onClear, 
  defaultValues = {}, 
  className,
  showAdvanced = false,
}) {
  const form = useForm({
    resolver: zodResolver(searchFilterSchema),
    defaultValues: {
      q: '',
      type: 'all',
      patientId: '',
      doctorId: '',
      dateFrom: '',
      dateTo: '',
      status: '',
      ...defaultValues,
    },
    mode: 'onChange',
  })

  const handleSubmit = form.watch((data) => {
    onSearch(data)
  })

  return (
    <form className={cn('space-y-4', className)}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            {...form.register('q')}
            placeholder="Search patients, prescriptions, medicines..."
            className="pl-10"
          />
        </div>
        <Select
          {...form.register('type')}
          options={[
            { value: 'all', label: 'All' },
            { value: 'patients', label: 'Patients' },
            { value: 'prescriptions', label: 'Prescriptions' },
            { value: 'medicines', label: 'Medicines' },
            { value: 'documents', label: 'Documents' },
          ]}
          placeholder="Type"
          className="w-36"
        />
      </div>

      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
          <div>
            <Label htmlFor="patientId">Patient ID</Label>
            <Input
              id="patientId"
              {...form.register('patientId')}
              placeholder="Patient ID"
            />
          </div>
          <div>
            <Label htmlFor="doctorId">Doctor ID</Label>
            <Input
              id="doctorId"
              {...form.register('doctorId')}
              placeholder="Doctor ID"
            />
          </div>
          <div>
            <Label htmlFor="dateFrom">Date From</Label>
            <Input
              id="dateFrom"
              type="date"
              {...form.register('dateFrom')}
            />
          </div>
          <div>
            <Label htmlFor="dateTo">Date To</Label>
            <Input
              id="dateTo"
              type="date"
              {...form.register('dateTo')}
            />
          </div>
          <div className="lg:col-span-4 flex gap-2">
            <Button type="button" variant="primary" onClick={() => form.handleSubmit(onSearch)()}>
              Search
            </Button>
            {onClear && (
              <Button type="button" variant="outline" onClick={onClear}>
                Clear
              </Button>
            )}
          </div>
        </div>
      )}
    </form>
  )
}