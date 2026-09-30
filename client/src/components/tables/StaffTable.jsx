import { cn } from '@/utils/cn'
import DataTable from './DataTable'
import { StatusBadge } from '@/components/common'
import { DateDisplay } from '@/components/common'
import Button from '@/components/ui/Button'
import { ToggleLeft, ToggleRight, UserCog } from 'lucide-react'

const columns = [
  { key: 'name', label: 'Name', sortable: true, render: (val, row) => (
    <div className="flex items-center gap-2">
      <UserCog className="h-4 w-4 text-success" />
      <div>
        <p className="font-medium">{val}</p>
        <p className="text-xs text-foreground-muted">{row.email}</p>
      </div>
    </div>
  )},
  { key: 'email', label: 'Email', sortable: true },
  { key: 'phone', label: 'Phone' },
  { key: 'status', label: 'Status', sortable: true, render: (val) => (
    <div className="flex items-center gap-2">
      <StatusBadge status={val} />
      <button className="p-1">
        {val === 'ACTIVE' ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
      </button>
    </div>
  )},
  { key: 'createdAt', label: 'Created', sortable: true, render: (val) => <DateDisplay date={val} format="dd MMM yyyy" /> },
]

export default function StaffTable({ 
  data, 
  loading, 
  onToggleStatus,
  className,
}) {
  return (
    <DataTable
      columns={columns}
      data={data}
      keyField="_id"
      loading={loading}
      emptyMessage="No staff members found"
      className={className}
    />
  )
}