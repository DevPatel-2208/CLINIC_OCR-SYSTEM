import { medicineApi } from '@/services'
import { useQuery } from '@tanstack/react-query'

export const medicineService = {
  getPatientHistory: (patientId) => medicineApi.getPatientHistory(patientId),
  searchByName: (name) => medicineApi.searchByName(name),
}

export function useMedicineHistory(patientId, options = {}) {
  return useQuery({
    queryKey: ['medicines-history', patientId],
    queryFn: () => medicineService.getPatientHistory(patientId).then((r) => r.data.data),
    enabled: !!patientId,
    ...options,
  })
}

export function useMedicineSearch(name, options = {}) {
  return useQuery({
    queryKey: ['medicines-search', name],
    queryFn: () => medicineService.searchByName(name).then((r) => r.data.data),
    enabled: name.length > 1,
    ...options,
  })
}
