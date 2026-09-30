import { patientApi } from '@/services'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useCreatePatient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => patientApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] })
    },
  })
}

export function useUpdatePatient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => patientApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['patients'] })
      queryClient.invalidateQueries({ queryKey: ['patient', id] })
    },
  })
}
