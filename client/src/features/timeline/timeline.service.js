import { timelineApi } from '@/services'
import { useQuery } from '@tanstack/react-query'

export const timelineService = {
  getPatientTimeline: (patientId) => timelineApi.getPatientTimeline(patientId),
}

export function useTreatmentTimeline(patientId, options = {}) {
  return useQuery({
    queryKey: ['timeline', patientId],
    queryFn: () => timelineService.getPatientTimeline(patientId).then((r) => r.data.data),
    enabled: !!patientId,
    ...options,
  })
}
