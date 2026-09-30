import { cn } from '@/utils/cn'
import DataTable from './DataTable'
import { StatusBadge } from '@/components/common'
import { DateDisplay } from '@/components/common'
import Button from '@/components/ui/Button'

const columns = [
  { key: 'patientName', label: 'Patient', sortable: true, render: (_, row) => (
    <div>
      <p className="font-medium">{row.patientId?.name || 'Unknown'}</p>
      <p className="text-xs text-foreground-muted">{row.patientId?.phone}</p>
    </div>
  )},
  { key: 'doctorName', label: 'Doctor', sortable: true, render: (_, row) => row.doctorId?.name || '-' },
  { key: 'prescriptionDate', label: 'Date', sortable: true, render: (val) => <DateDisplay date={val} format="dd MMM yyyy" /> },
  { key: 'status', label: 'Status', sortable: true, render: (val) => <StatusBadge status={val} dot /> },
  { key: 'summary', label: 'Summary', render: (_, row) => row.ai?.summary?.substring(0, 60) || 'No summary' },
  { key: 'actions', label: 'Actions', render: (_, row) => (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="sm" className="text-primary-600 hover:bg-primary-50">View</Button>
      {row.processingStatus === 'NEEDS_REVIEW' && (
        <Button variant="ghost" size="sm" className="text-success hover:bg-success-surface">Review</Button>
      )}
    </div>
  )},
]

export default function PrescriptionTable({ 
  data, 
  loading, 
  onRowClick,
  pagination,
  currentPage,
  totalPages,
  onPageChange,
  className,
}) {
  return (
    <DataTable
      columns={columns}
      data={data}
      keyField="_id"
      loading={loading}
      emptyMessage="No prescriptions found"
      onRowClick={onRowClick}
      pagination={pagination}
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={onPageChange}
      className={className}
    />
  )
}