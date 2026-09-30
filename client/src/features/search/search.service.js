import { searchApi, patientApi } from '@/services'
import { useQuery } from '@tanstack/react-query'

export const searchService = {
  search: (params) => searchApi.search(params),
  semanticSearch: (data) => searchApi.semanticSearch(data),
  patientSearch: (q) => patientApi.search(q),
}

export function useSearch(query, options = {}) {
  return useQuery({
    queryKey: ['search', query],
    queryFn: () => searchService.search({ q: query }).then((r) => r.data.data),
    enabled: query.length > 1,
    ...options,
  })
}

export function usePatientSearch(query, options = {}) {
  return useQuery({
    queryKey: ['patient-search', query],
    queryFn: () => searchService.patientSearch(query).then((r) => r.data.data),
    enabled: query.length > 1,
    ...options,
  })
}

export function useSemanticSearch() {
  return useQuery({
    queryKey: ['semantic-search'],
    queryFn: () => searchService.semanticSearch({}).then((r) => r.data.data),
    enabled: false,
  })
}
