import { prescriptionApi } from '@/services'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export const prescriptionService = {
  list: (params) => prescriptionApi.list(params),
  getById: (id) => prescriptionApi.getById(id),
  upload: (formData) => prescriptionApi.upload(formData),
  review: (id, data) => prescriptionApi.review(id, data),
  approve: (id, data) => prescriptionApi.approve(id, data),
  reject: (id, data) => prescriptionApi.reject(id, data),
  retry: (id) => prescriptionApi.retry(id),
  compare: (id) => prescriptionApi.compare(id),
  toggleImportant: (id) => prescriptionApi.toggleImportant(id),
  getRevisions: (id) => prescriptionApi.getRevisions(id),
}

export function usePrescriptions(params, options = {}) {
  return useQuery({
    queryKey: ['prescriptions', params],
    queryFn: () => prescriptionService.list(params).then((r) => r.data.data),
    ...options,
  })
}

export function usePrescription(id, options = {}) {
  return useQuery({
    queryKey: ['prescription', id],
    queryFn: () => prescriptionService.getById(id).then((r) => r.data.data),
    enabled: !!id,
    ...options,
  })
}

export function usePrescriptionComparison(id, options = {}) {
  return useQuery({
    queryKey: ['prescription-compare', id],
    queryFn: () => prescriptionService.compare(id).then((r) => r.data.data),
    enabled: !!id,
    ...options,
  })
}

export function usePrescriptionRevisions(id, options = {}) {
  return useQuery({
    queryKey: ['prescription-revisions', id],
    queryFn: () => prescriptionService.getRevisions(id).then((r) => r.data.data),
    enabled: !!id,
    ...options,
  })
}

export function useUploadPrescription() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (formData) => prescriptionService.upload(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] })
    },
  })
}

export function useApprovePrescription() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => prescriptionService.approve(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] })
      queryClient.invalidateQueries({ queryKey: ['prescription', id] })
    },
  })
}

export function useRejectPrescription() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => prescriptionService.reject(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] })
      queryClient.invalidateQueries({ queryKey: ['prescription', id] })
    },
  })
}

export function useReviewPrescription() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => prescriptionService.review(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['prescription', id] })
    },
  })
}

export function useRetryPrescription() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => prescriptionService.retry(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] })
      queryClient.invalidateQueries({ queryKey: ['prescription', id] })
    },
  })
}

export function useToggleImportant() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => prescriptionService.toggleImportant(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] })
    },
  })
}
