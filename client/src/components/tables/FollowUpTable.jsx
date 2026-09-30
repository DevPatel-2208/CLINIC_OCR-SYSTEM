import { cn } from '@/utils/cn'
import DataTable from './DataTable'
import { StatusBadge } from '@/components/common'
import { DateDisplay } from '@/components/common'
import Button from '@/components/ui/Button'
import { Clock, CheckCircle2, XCircle, User } from 'lucide-react'

const statusIcons = {
  UPCOMING: Clock,
  COMPLETED: CheckCircle2,
  MISSED: XCircle,
  CANCELLED: XCircle,
}

const columns = [
  { key: 'patientName', label: 'Patient', sortable: true, render: (_, row) => (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 bg-success-surface rounded-full flex items-center justify-center">
        <User className="h-4 w-4 text-success" />
      </div>
      <div>
        <p className="font-medium">{row.patientId?.name || 'Unknown'}</p>
        <p className="text-xs text-foreground-muted">{row.patientId?.phone}</p>
      </div>
    </div>
  )},
  { key: 'date', label: 'Date', sortable: true, render: (val) => <DateDisplay date={val} format="dd MMM yyyy HH:mm" /> },
  { key: 'reason', label: 'Reason' },
  { key: 'status', label: 'Status', sortable: true, render: (val) => (
    <div className="flex items-center gap-2">
      <StatusBadge status={val} />
    </div>
  )},
  { key: 'actions', label: 'Actions', render: (_, row) => (
    <div className="flex items-center gap-1">
      {row.status === 'UPCOMING' && (
        <>
          <Button variant="ghost" size="sm" className="text-success hover:bg-success-surface">Complete</Button>
          <Button variant="ghost" size="sm" className="text-error hover:bg-error-surface">Cancel</Button>
        </>
      )}
    </div>
  )},
]

export default function FollowUpTable({ 
  data, 
  loading, 
  onRowClick,
  onStatusChange,
  className,
}) {
  return (
    <DataTable
      columns={columns}
      data={data}
      keyField="_id"
      loading={loading}
      emptyMessage="No follow-ups found"
      onRowClick={onRowClick}
      className={className}
    />
  )
}