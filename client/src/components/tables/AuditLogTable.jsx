import { cn } from '@/utils/cn'
import DataTable from './DataTable'
import { StatusBadge } from '@/components/common'
import { DateDisplay } from '@/components/common'
import Button from '@/components/ui/Button'

const columns = [
  { key: 'userName', label: 'User', sortable: true, render: (_, row) => row.userId?.name || 'Unknown' },
  { key: 'action', label: 'Action', sortable: true },
  { key: 'entity', label: 'Entity', sortable: true },
  { key: 'entityId', label: 'Entity ID' },
  { key: 'createdAt', label: 'Date', sortable: true, render: (val) => <DateDisplay date={val} format="dd MMM yyyy HH:mm:ss" /> },
]

export default function AuditLogTable({ 
  data, 
  loading, 
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
      emptyMessage="No audit logs found"
      pagination={pagination}
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={onPageChange}
      className={className}
    />
  )
}