import { useAuditLogs } from '@/features/audit'
import { motion, AnimatePresence } from "motion"
import { PageHeader, SectionCard, EmptyState, ErrorState, DateDisplay, Avatar } from '@/components/common'
import { fadeUp, fadeScale, staggerContainer, staggerItem, listItem } from '@/motion/variants'
import { Skeleton, Badge } from '@/components/ui'
import { ScrollText, Clock, Briefcase } from 'lucide-react'

function ActionBadge({ action }) {
  const key = (action || '').toUpperCase()
  let variant = 'default'
  if (key.includes('DELETE') || key.includes('REJECT')) variant = 'danger'
  else if (key.includes('CREATE') || key.includes('APPROVE') || key.includes('ADD')) variant = 'success'
  else if (key.includes('UPDATE') || key.includes('EDIT')) variant = 'info'
  else if (key.includes('LOGIN') || key.includes('LOGOUT')) variant = 'warning'
  return <Badge variant={variant}>{action}</Badge>
}

export default function AdminAuditLogs() {
  const { data, isLoading, isError, refetch } = useAuditLogs({})

  return (
    <motion.div initial={fadeUp.initial} animate={fadeUp.animate} transition={fadeUp.animate.transition} className="will-change-transform">
      <PageHeader
        title="Audit Logs"
        description="Chronological record of administrative and clinical actions for compliance."
      />

      <SectionCard
        title="Activity Log"
        description={data?.length ? `${data.length} event${data.length > 1 ? 's' : ''} recorded` : undefined}
        icon={ScrollText}
      >
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}
          </div>
        ) : isError ? (
          <ErrorState title="Unable to load audit logs" message="We couldn't retrieve activity logs. Please try again." onRetry={refetch} />
        ) : !data || data.length === 0 ? (
          <EmptyState title="No audit logs" description="Recorded administrative actions will appear here." className="py-10" />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border-subtle">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-foreground-muted text-xs uppercase tracking-wide">User</th>
                    <th className="text-left px-4 py-3 font-medium text-foreground-muted text-xs uppercase tracking-wide">Action</th>
                    <th className="text-left px-4 py-3 font-medium text-foreground-muted text-xs uppercase tracking-wide">Entity</th>
                    <th className="text-left px-4 py-3 font-medium text-foreground-muted text-xs uppercase tracking-wide">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {data.map((log) => (
                    <tr key={log._id} className="hover:bg-surface-muted transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={log.userId?.name} size="sm" />
                          <span className="font-medium text-foreground">{log.userId?.name || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3"><ActionBadge action={log.action} /></td>
                      <td className="px-4 py-3 text-foreground-secondary inline-flex items-center gap-1.5">
                        <Briefcase className="h-3 w-3 text-foreground-muted" /> {log.entity || '-'}
                      </td>
                      <td className="px-4 py-3 text-foreground-muted inline-flex items-center gap-1.5">
                        <Clock className="h-3 w-3 text-foreground-muted" />
                        <DateDisplay date={log.createdAt} format="dd MMM yyyy HH:mm" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden space-y-3">
              {data.map((log) => (
                <div key={log._id} className="border border-border-subtle rounded-xl p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar name={log.userId?.name} size="sm" />
                      <p className="font-medium text-foreground truncate">{log.userId?.name || 'Unknown'}</p>
                    </div>
                    <ActionBadge action={log.action} />
                  </div>
                  <div className="mt-3 space-y-1 text-xs text-foreground-muted">
                    <p className="inline-flex items-center gap-1.5"><Briefcase className="h-3 w-3 text-foreground-muted" /> {log.entity || '-'}</p>
                    <p className="inline-flex items-center gap-1.5"><Clock className="h-3 w-3 text-foreground-muted" /> <DateDisplay date={log.createdAt} format="dd MMM yyyy HH:mm" /></p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </SectionCard>
    </motion.div>
  )
}
