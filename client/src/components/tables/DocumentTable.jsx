import { cn } from '@/utils/cn'
import DataTable from './DataTable'
import { StatusBadge } from '@/components/common'
import { DateDisplay } from '@/components/common'
import Button from '@/components/ui/Button'
import { FileText, Eye, Download } from 'lucide-react'

const columns = [
  { key: 'title', label: 'Title', sortable: true, render: (val, row) => (
    <div>
      <p className="font-medium">{val}</p>
      <p className="text-xs text-foreground-muted capitalize">{row.type}</p>
    </div>
  )},
  { key: 'description', label: 'Description' },
  { key: 'fileSize', label: 'Size', sortable: true, render: (val) => `${(val / 1024 / 1024).toFixed(2)} MB` },
  { key: 'uploadedBy', label: 'Uploaded By', render: (val) => val?.name || 'Unknown' },
  { key: 'createdAt', label: 'Date', sortable: true, render: (val) => <DateDisplay date={val} format="dd MMM yyyy" /> },
  { key: 'actions', label: 'Actions', render: (_, row) => (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="sm" className="text-primary-600 hover:bg-primary-50">
        <Eye className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" className="text-foreground-secondary hover:bg-surface-muted">
        <Download className="h-4 w-4" />
      </Button>
    </div>
  )},
]

export default function DocumentTable({ 
  data, 
  documents,
  loading, 
  className,
  onView,
  onDownload,
  onDelete,
}) {
  const rows = data || documents || []
  const cols = [
    { key: 'title', label: 'Title', sortable: true, render: (val, row) => (
      <div>
        <p className="font-medium">{val}</p>
        <p className="text-xs text-foreground-muted capitalize">{row.type}</p>
      </div>
    )},
    { key: 'description', label: 'Description' },
    { key: 'fileSize', label: 'Size', sortable: true, render: (val) => val ? `${(val / 1024 / 1024).toFixed(2)} MB` : '-' },
    { key: 'uploadedBy', label: 'Uploaded By', render: (val) => val?.name || 'Unknown' },
    { key: 'createdAt', label: 'Date', sortable: true, render: (val) => <DateDisplay date={val} format="dd MMM yyyy" /> },
    { key: 'actions', label: 'Actions', render: (_, row) => (
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" className="text-primary-600 hover:bg-primary-50 min-h-[44px] min-w-[44px]" aria-label="View" onClick={(e) => { e.stopPropagation(); if (onView) onView(row); else if (row.fileUrl) window.open(row.fileUrl, '_blank') }}>
          <Eye className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="text-foreground-secondary hover:bg-surface-muted min-h-[44px] min-w-[44px]" aria-label="Download" onClick={(e) => { e.stopPropagation(); if (onDownload) onDownload(row); else if (row.fileUrl) window.open(row.fileUrl, '_blank') }}>
          <Download className="h-4 w-4" />
        </Button>
        {onDelete && (
          <Button variant="ghost" size="sm" className="text-error hover:bg-error-surface min-h-[44px] min-w-[44px]" aria-label="Delete" onClick={(e) => { e.stopPropagation(); onDelete(row._id || row.id) }}>
            <FileText className="h-4 w-4" />
          </Button>
        )}
      </div>
    )},
  ]
  return (
    <DataTable
      columns={cols}
      data={rows}
      keyField="_id"
      loading={loading}
      emptyMessage="No documents found"
      className={className}
    />
  )
}