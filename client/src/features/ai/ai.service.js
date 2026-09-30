import { aiApi, assistantApi } from '@/services'
import { useMutation } from '@tanstack/react-query'

export const aiService = {
  extract: (prescriptionId) => aiApi.extract(prescriptionId),
  validate: (prescriptionId) => aiApi.validate(prescriptionId),
  askAssistant: (data) => assistantApi.ask(data),
}

export function useAIExtraction() {
  return useMutation({
    mutationFn: (prescriptionId) => aiService.extract(prescriptionId),
  })
}

export function useAIValidation() {
  return useMutation({
    mutationFn: (prescriptionId) => aiService.validate(prescriptionId),
  })
}

export function useAIAssistant() {
  return useMutation({
    mutationFn: (data) => aiService.askAssistant(data),
  })
}
