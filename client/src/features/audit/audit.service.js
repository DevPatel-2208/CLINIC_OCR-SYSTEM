import { adminApi } from '@/services'
import { useQuery } from '@tanstack/react-query'

export const auditService = {
  getAuditLogs: (params) => adminApi.getAuditLogs(params),
}

export function useAuditLogs(params, options = {}) {
  return useQuery({
    queryKey: ['audit-logs', params],
    queryFn: () => auditService.getAuditLogs(params).then((r) => r.data.data),
    ...options,
  })
}
