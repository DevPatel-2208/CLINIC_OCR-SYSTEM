import { analyticsApi, adminApi } from '@/services'
import { useQuery } from '@tanstack/react-query'

export const analyticsService = {
  getDashboard: () => analyticsApi.getDashboard(),
  getAIEvaluation: () => analyticsApi.getAIEvaluation(),
  getAdminAnalytics: () => adminApi.getAnalytics(),
  getAdminDashboard: () => adminApi.getDashboard(),
}

export function useDashboardAnalytics(options = {}) {
  return useQuery({
    queryKey: ['dashboard-analytics'],
    queryFn: () => analyticsService.getDashboard().then((r) => r.data.data),
    ...options,
  })
}

export function useAIEvaluation(options = {}) {
  return useQuery({
    queryKey: ['ai-evaluation'],
    queryFn: () => analyticsService.getAIEvaluation().then((r) => r.data.data),
    ...options,
  })
}

export function useAdminAnalytics(options = {}) {
  return useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => analyticsService.getAdminAnalytics().then((r) => r.data.data),
    ...options,
  })
}

export function useAdminDashboard(options = {}) {
  return useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => analyticsService.getAdminDashboard().then((r) => r.data.data),
    ...options,
  })
}
