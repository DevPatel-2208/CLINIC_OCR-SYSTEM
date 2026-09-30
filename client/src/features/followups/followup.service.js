import { followUpApi } from '@/services'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export const followUpService = {
  list: (params) => followUpApi.list(params),
  create: (data) => followUpApi.create(data),
  getById: (id) => followUpApi.getById(id),
  update: (id, data) => followUpApi.update(id, data),
  updateStatus: (id, status) => followUpApi.updateStatus(id, status),
  remove: (id) => followUpApi.remove(id),
}

export function useFollowUps(params, options = {}) {
  return useQuery({
    queryKey: ['followups', params],
    queryFn: () => followUpService.list(params).then((r) => r.data),
    ...options,
  })
}

export function useFollowUpMeta(params, options = {}) {
  return useQuery({
    queryKey: ['followups', params, 'meta'],
    queryFn: () => followUpService.list(params).then((r) => r.data.meta),
    ...options,
  })
}

export function useCreateFollowUp() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => followUpService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followups'] })
    },
  })
}

export function useUpdateFollowUp() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => followUpService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followups'] })
    },
  })
}

export function useUpdateFollowUpStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }) => followUpService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followups'] })
    },
  })
}

export function useDeleteFollowUp() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => followUpService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followups'] })
    },
  })
}
