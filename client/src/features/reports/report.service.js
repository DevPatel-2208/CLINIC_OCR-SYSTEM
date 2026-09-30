import { reportApi } from '@/services'
import { useMutation } from '@tanstack/react-query'

export const reportService = {
  generatePrescriptionReport: (id) => reportApi.generatePrescriptionReport(id),
  getPatientReports: (patientId) => reportApi.getPatientReports(patientId),
}

export function useGenerateReport() {
  return useMutation({
    mutationFn: (id) => reportService.generatePrescriptionReport(id),
  })
}
