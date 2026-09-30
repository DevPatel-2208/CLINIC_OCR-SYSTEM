import { cn } from '@/utils/cn'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { motion } from 'motion'
import Button from '@/components/ui/Button'

export default function Pagination({ 
  currentPage = 1, 
  totalPages = 1, 
  onPageChange, 
  showPageNumbers = true,
  maxPageButtons = 5,
  className 
}) {
  if (totalPages <= 1) return null

  const pages = []
  const half = Math.floor(maxPageButtons / 2)
  let start = Math.max(1, currentPage - half)
  let end = Math.min(totalPages, start + maxPageButtons - 1)

  if (end - start + 1 < maxPageButtons) {
    start = Math.max(1, end - maxPageButtons + 1)
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  const renderPage = (page) => {
    const isActive = currentPage === page
    return (
      <div key={page} className="relative">
        {isActive && (
          <motion.div
            layoutId="activePageIndicator"
            className="absolute inset-0 bg-primary-600 rounded-lg"
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            style={{ willChange: 'transform' }}
          />
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(page)}
          className={cn(
            'relative transition-colors duration-150',
            isActive && 'text-white hover:text-white hover:bg-transparent'
          )}
          aria-current={isActive ? 'page' : undefined}
        >
          {page}
        </Button>
      </div>
    )
  }

  return (
    <nav className={cn('flex items-center justify-center gap-2', className)} aria-label="Pagination">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
        className="transition-colors duration-150"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {showPageNumbers && (
        <div className="flex items-center gap-1">
          {start > 1 && (
            <>
              {renderPage(1)}
              {start > 2 && <span className="px-2 text-foreground-muted">...</span>}
            </>
          )}
          {pages.map((page) => renderPage(page))}
          {end < totalPages && (
            <>
              {end < totalPages - 1 && <span className="px-2 text-foreground-muted">...</span>}
              {renderPage(totalPages)}
            </>
          )}
        </div>
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
        className="transition-colors duration-150"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  )
}
