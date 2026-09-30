import { useState, useMemo } from 'react'
import { cn } from '@/utils/cn'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { motion } from 'motion'
import Button from '@/components/ui/Button'
import { LoadingState } from '@/components/common'
import { EmptyState } from '@/components/common'
import { Pagination } from '@/components/common'
import { staggerContainer, listItem } from '@/motion/variants'

export default function DataTable({ 
  columns = [], 
  data = [], 
  keyField = 'id',
  loading = false,
  emptyMessage = 'No data available',
  emptyIcon,
  onRowClick,
  sortable = true,
  pagination = false,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  pageSize = 10,
  totalItems = 0,
  className,
  renderToolbar,
  rowClassName,
  striped = true,
  hover = true,
}) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })

  const handleSort = (key) => {
    if (!sortable) return
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }))
  }

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return data
    return [...data].sort((a, b) => {
      const aVal = a[sortConfig.key]
      const bVal = b[sortConfig.key]
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })
  }, [data, sortConfig])

  if (loading) {
    return <LoadingState message="Loading table data..." size="lg" fullScreen={false} />
  }

  if (!data.length) {
    return <EmptyState icon={emptyIcon} title={emptyMessage} className="py-8" />
  }

  return (
    <div className={cn('bg-surface rounded-xl border border-border overflow-hidden', className)}>
        {renderToolbar && <div className="p-4 border-b border-border">{renderToolbar}</div>}
      
      <div className="overflow-x-auto">
        <table className="w-full" role="grid">
          <thead className="bg-surface-muted border-b border-border">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={cn(
                    'px-4 py-3 text-left text-xs font-medium text-foreground-muted uppercase tracking-wider',
                    column.sortable && sortable && 'cursor-pointer hover:bg-surface-muted select-none'
                  )}
                  onClick={() => column.sortable && sortable && handleSort(column.key)}
                  style={{ width: column.width }}
                >
                  <div className="flex items-center gap-1">
                    {column.label}
                    {column.sortable && sortable && sortConfig.key === column.key && (
                      sortConfig.direction === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <motion.tbody
            variants={staggerContainer()}
            initial="initial"
            animate="animate"
            className={cn('divide-y divide-border-subtle', striped && 'even:bg-surface-muted')}
          >
            {sortedData.map((row, rowIndex) => (
              <motion.tr
                key={row[keyField] || rowIndex}
                variants={listItem}
                className={cn(
                  hover && 'hover:bg-surface-muted transition-colors',
                  onRowClick && 'cursor-pointer',
                  rowClassName?.(row)
                )}
                onClick={() => onRowClick?.(row)}
                style={{ willChange: 'transform, opacity' }}
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-3 text-sm text-foreground">
                    {column.render 
                      ? column.render(row[column.key], row, rowIndex)
                      : row[column.key] ?? '-'}
                  </td>
                ))}
              </motion.tr>
            ))}
          </motion.tbody>
        </table>
      </div>

      {pagination && totalPages > 1 && (
        <div className="px-4 py-3 border-t border-border flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
          <div className="text-sm text-foreground-muted">
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} results
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  )
}
