import api from '@/services/api'

export const documentService = {
  list: (patientId) => api.get(`/documents/patient/${patientId}`),
  getById: (id) => api.get(`/documents/${id}`),
  upload: (formData) => api.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  delete: (id) => api.delete(`/documents/${id}`),
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function usePatientDocuments(patientId, options = {}) {
  return useQuery({
    queryKey: ['documents', patientId],
    queryFn: () => documentService.list(patientId).then((r) => r.data.data),
    enabled: !!patientId,
    ...options,
  })
}

export function useDocument(id, options = {}) {
  return useQuery({
    queryKey: ['document', id],
    queryFn: () => documentService.getById(id).then((r) => r.data.data),
    enabled: !!id,
    ...options,
  })
}

export function useUploadDocument() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (formData) => documentService.upload(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
    },
  })
}

export function useDeleteDocument() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => documentService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
    },
  })
}
