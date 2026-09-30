import { cn } from '@/utils/cn'
import DataTable from './DataTable'
import { StatusBadge } from '@/components/common'
import { DateDisplay } from '@/components/common'
import Button from '@/components/ui/Button'

const columns = [
  { key: 'name', label: 'Name', sortable: true, render: (val, row) => (
    <div>
      <p className="font-medium">{val}</p>
      <p className="text-xs text-foreground-muted">{row.phone}</p>
    </div>
  )},
  { key: 'gender', label: 'Gender', sortable: true },
  { key: 'bloodGroup', label: 'Blood Group', sortable: true },
  { key: 'assignedDoctor', label: 'Assigned Doctor', sortable: true, render: (val) => val?.name || '-' },
  { key: 'createdAt', label: 'Created', sortable: true, render: (val) => <DateDisplay date={val} format="dd MMM yyyy" /> },
  { key: 'actions', label: 'Actions', render: (_, row) => (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="sm" className="text-primary-600 hover:bg-primary-50">View</Button>
    </div>
  )},
]

export default function PatientTable({ 
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
      emptyMessage="No patients found"
      onRowClick={onRowClick}
      pagination={pagination}
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={onPageChange}
      className={className}
    />
  )
}