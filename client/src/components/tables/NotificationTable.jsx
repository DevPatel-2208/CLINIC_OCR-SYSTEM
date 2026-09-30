import { cn } from '@/utils/cn'
import DataTable from './DataTable'
import { StatusBadge } from '@/components/common'
import { DateDisplay } from '@/components/common'
import Button from '@/components/ui/Button'

const columns = [
  { key: 'type', label: 'Type', sortable: true, render: (val) => (
    <span className="capitalize">{val.replace('_', ' ')}</span>
  )},
  { key: 'title', label: 'Title' },
  { key: 'message', label: 'Message' },
  { key: 'read', label: 'Status', sortable: true, render: (val) => (
    <StatusBadge status={val ? 'COMPLETED' : 'UPCOMING'} />
  )},
  { key: 'createdAt', label: 'Date', sortable: true, render: (val) => <DateDisplay date={val} relative /> },
  { key: 'actions', label: 'Actions', render: (_, row) => (
    !row.read && (
      <Button variant="ghost" size="sm" className="text-primary-600 hover:bg-primary-50">Mark Read</Button>
    )
  )},
]

export default function NotificationTable({ 
  data, 
  loading, 
  onMarkRead,
  className,
}) {
  return (
    <DataTable
      columns={columns}
      data={data}
      keyField="_id"
      loading={loading}
      emptyMessage="No notifications"
      className={className}
    />
  )
}