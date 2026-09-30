import { cn } from '@/utils/cn'
import DataTable from './DataTable'
import { ConfidenceBadge } from '@/components/common'
import { DateDisplay } from '@/components/common'
import Button from '@/components/ui/Button'

const columns = [
  { key: 'name', label: 'Medicine', sortable: true, render: (val, row) => (
    <div>
      <p className="font-medium">{val}</p>
      <p className="text-xs text-foreground-muted">{row.dosage} {row.frequency} {row.duration}</p>
    </div>
  )},
  { key: 'dosage', label: 'Dosage' },
  { key: 'frequency', label: 'Frequency' },
  { key: 'duration', label: 'Duration' },
  { key: 'confidence', label: 'Confidence', render: (val) => <ConfidenceBadge value={val} /> },
  { key: 'prescriptionDate', label: 'Date', sortable: true, render: (_, row) => <DateDisplay date={row.prescriptionId?.prescriptionDate || row.createdAt} /> },
]

export default function MedicineTable({ 
  data, 
  loading, 
  onRowClick,
  className,
}) {
  return (
    <DataTable
      columns={columns}
      data={data}
      keyField="_id"
      loading={loading}
      emptyMessage="No medicines found"
      onRowClick={onRowClick}
      className={className}
    />
  )
}