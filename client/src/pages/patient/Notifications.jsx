import { useNotifications, useMarkAllNotificationsRead } from '@/features/notifications'
import { motion, AnimatePresence } from "motion"
import { PageHeader, EmptyState, ErrorState, DateDisplay } from '@/components/common'
import { fadeUp, fadeScale, staggerContainer, staggerItem, listItem } from '@/motion/variants'
import { Skeleton } from '@/components/ui'
import { BellRing, Bell, CheckCheck } from 'lucide-react'
import Button from '@/components/ui/Button'

export default function PatientNotifications() {
  const { data, isLoading, isError, refetch } = useNotifications()
  const markAllRead = useMarkAllNotificationsRead()

  if (isLoading) {
    return (
    <div><Skeleton className="will-change-transform h-9 w-56 mb-2" />
        <Skeleton className="h-4 w-72 mb-8" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      </div>
    )
  }

  if (isError) return <ErrorState title="Unable to load notifications" message="We couldn't retrieve your notifications. Please try again." onRetry={refetch} />

  const unread = (data || []).filter((n) => !n.read).length

  return (
    <motion.div initial={fadeUp.initial} animate={fadeUp.animate} transition={fadeUp.animate.transition} className="max-w-2xl mx-auto will-change-transform">
      <PageHeader
        title="Notifications"
        description={`${unread > 0 ? `${unread} unread · ` : ''}Updates from your clinic.`}
        action={
          (data?.length > 0 && unread > 0) ? (
            <Button variant="outline" size="sm" onClick={() => markAllRead.mutate()}>
              <CheckCheck className="h-3.5 w-3.5" /> Mark all as read
            </Button>
          ) : null
        }
      />

      {(!data || data.length === 0) ? (
        <EmptyState
          icon={BellRing}
          title="No notifications yet"
          description="Updates from your clinic will appear here."
        />
      ) : (
        <div className="space-y-3">
          {data.map((n) => (
            <div
              key={n._id}
              className={`card-surface p-5 flex items-start gap-4 ${!n.read ? 'border-l-4 border-l-primary-600' : ''}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${n.read ? 'bg-surface-muted text-foreground-muted' : 'bg-secondary-50 text-secondary-700'}`}>
                {n.read ? <Bell className="h-5 w-5" /> : <BellRing className="h-5 w-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-3">
                  <p className={`${n.read ? 'text-foreground-secondary' : 'text-foreground font-semibold'}`}>{n.title}</p>
                  {!n.read && <span className="h-2 w-2 rounded-full bg-secondary-600 shrink-0" />}
                </div>
                <p className="text-sm text-foreground-secondary mt-0.5">{n.message}</p>
                <p className="text-xs text-foreground-muted mt-1.5">
                  <DateDisplay date={n.createdAt} format="dd MMM yyyy HH:mm" />
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
