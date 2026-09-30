import { prescriptionApi } from '@/services'
import { useQuery } from '@tanstack/react-query'

export const comparisonService = {
  compare: (id) => prescriptionApi.compare(id),
}

export function usePrescriptionComparison(id, options = {}) {
  return useQuery({
    queryKey: ['compare', id],
    queryFn: () => comparisonService.compare(id).then((r) => r.data.data),
    enabled: !!id,
    ...options,
  })
}
