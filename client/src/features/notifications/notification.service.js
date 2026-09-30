import { notificationApi } from '@/services'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export const notificationService = {
  list: () => notificationApi.list(),
  markAsRead: (id) => notificationApi.markAsRead(id),
  markAllAsRead: () => notificationApi.markAllAsRead(),
}

export function useNotifications(options = {}) {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationService.list().then((r) => r.data.data),
    ...options,
  })
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}
