import { useState } from 'react'

export function usePagination({ initialPage = 1, initialPageSize = 10 } = {}) {
  const [page, setPage] = useState(initialPage)
  const [pageSize, setPageSize] = useState(initialPageSize)

  const totalPages = (totalItems) => Math.ceil(totalItems / pageSize)

  const goToPage = (newPage) => setPage(newPage)
  const nextPage = () => setPage((p) => p + 1)
  const prevPage = () => setPage((p) => Math.max(1, p - 1))
  const resetPage = () => setPage(1)

  const paginationProps = (totalItems) => ({
    currentPage: page,
    totalPages: totalPages(totalItems),
    onPageChange: setPage,
    pageSize,
    totalItems,
  })

  return {
    page,
    pageSize,
    setPage,
    setPageSize,
    totalPages,
    goToPage,
    nextPage,
    prevPage,
    resetPage,
    paginationProps,
  }
}
