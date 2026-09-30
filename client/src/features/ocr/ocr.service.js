import { ocrApi } from '@/services'
import { useMutation } from '@tanstack/react-query'

export const ocrService = {
  processImage: (prescriptionId) => ocrApi.processImage(prescriptionId),
  getStatus: (id) => ocrApi.getStatus(id),
}

export function useOCRProcessing() {
  return useMutation({
    mutationFn: (prescriptionId) => ocrService.processImage(prescriptionId),
  })
}
