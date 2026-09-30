import { useState } from 'react'
import { motion, AnimatePresence } from "motion"
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fadeUp, fadeScale, staggerContainer, staggerItem, listItem } from '@/motion/variants'
import { toast } from 'sonner'
import { followUpApi, patientApi } from '../../services'
import { PageHeader, EmptyState, ErrorState, StatusBadge, DateDisplay, Avatar, SearchBar } from '@/components/common'
import { Skeleton, Dialog, Button } from '@/components/ui'
import { CalendarClock, Plus, Calendar, Check, X } from 'lucide-react'

export default function ReceptionistFollowUps() {
  const queryClient = useQueryClient()
  const [createOpen, setCreateOpen] = useState(false)
  const [patientId, setPatientId] = useState('')
  const [patientName, setPatientName] = useState('')
  const [search, setSearch] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [date, setDate] = useState('')
  const [reason, setReason] = useState('')
  const [notes, setNotes] = useState('')

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['staff-followups'],
    queryFn: () => followUpApi.list({}).then((r) => r.data.data),
  })

  const createMutation = useMutation({
    mutationFn: (body) => followUpApi.create(body),
    onSuccess: () => {
      toast.success('Follow-up scheduled')
      setCreateOpen(false)
      setPatientId(''); setPatientName(''); setSearch(''); setDate(''); setReason(''); setNotes('')
      queryClient.invalidateQueries({ queryKey: ['staff-followups'] })
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Could not schedule follow-up'),
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => followUpApi.updateStatus(id, status),
    onSuccess: () => {
      toast.success('Follow-up status updated')
      queryClient.invalidateQueries({ queryKey: ['staff-followups'] })
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Could not update status'),
  })

  const { data: results, isLoading: searching } = useQuery({
    queryKey: ['staff-followup-search', search],
    queryFn: () => patientApi.search(search).then((r) => r.data.data),
    enabled: search.length > 1,
  })

  const handleCreate = () => {
    if (!patientId || !date) return
    createMutation.mutate({ patientId, date, reason: reason || undefined, notes: notes || undefined })
  }

  if (isLoading) {
    return (
    <div><Skeleton className="will-change-transform h-9 w-56 mb-2" />
        <Skeleton className="h-4 w-96 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      </div>
    )
  }

  if (isError) return <ErrorState title="Unable to load follow-ups" message="We couldn't retrieve follow-up records. Please try again." onRetry={refetch} />

  const inputClass = "field-input px-3 py-2 text-sm"

  return (
    <motion.div initial={fadeUp.initial} animate={fadeUp.animate} transition={fadeUp.animate.transition} className="max-w-5xl mx-auto will-change-transform">
      <PageHeader
        title="Follow-ups"
        description="Schedule and manage patient follow-up visits."
        action={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" /> Schedule Follow-up
          </Button>
        }
      />

      {(!data || data.length === 0) ? (
        <EmptyState
          icon={CalendarClock}
          title="No follow-ups scheduled"
          description="Schedule a follow-up to begin managing patient visits."
          action={<Button onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4" /> Schedule Follow-up</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((f) => (
            <div key={f._id} className="card-surface p-5 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <StatusBadge status={f.status} dot />
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-secondary-50 text-secondary-700 rounded-lg flex items-center justify-center shrink-0">
                  <Calendar className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground truncate">{f.patientId?.name || 'Unknown Patient'}</p>
                   <p className="text-xs text-foreground-muted mt-0.5">
                    <DateDisplay date={f.date} format="dd MMM yyyy HH:mm" />
                  </p>
                </div>
              </div>
               {f.reason && <p className="text-sm text-foreground-secondary mt-3">{f.reason}</p>}
              {f.status === 'UPCOMING' && (
                <div className="mt-4 pt-4 border-t border-border flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 justify-center" onClick={() => statusMutation.mutate({ id: f._id, status: 'COMPLETED' })}>
                    <Check className="h-3.5 w-3.5" /> Mark Completed
                  </Button>
                  <Button size="sm" variant="ghost" className="flex-1 justify-center" onClick={() => statusMutation.mutate({ id: f._id, status: 'CANCELLED' })}>
                    <X className="h-3.5 w-3.5" /> Cancel
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create follow-up dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} title="Schedule Follow-up" size="lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground-secondary mb-1">Patient *</label>
            {patientName ? (
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary-50 border border-secondary-200">
                <div className="flex items-center gap-3">
                  <Avatar name={patientName} size="sm" />
                  <p className="text-sm font-medium text-foreground">{patientName}</p>
                </div>
                <button onClick={() => { setPatientId(''); setPatientName('') }} className="p-1 text-foreground-subtle hover:text-foreground-secondary" aria-label="Change patient">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setShowSearch(true) }}
                  onFocus={() => setShowSearch(true)}
                  onBlur={() => setTimeout(() => setShowSearch(false), 200)}
                  placeholder="Search patient..."
                  className={inputClass}
                />
                {showSearch && search.length > 1 && (
                  <div className="absolute z-20 mt-2 w-full bg-surface border border-border rounded-lg shadow-card max-h-48 overflow-y-auto">
                    {searching ? (
                      <div className="p-3"><Skeleton className="h-10 w-full" count={2} /></div>
                    ) : results?.length > 0 ? (
                      results.map((p) => (
                        <button
                          key={p._id}
                          onClick={() => { setPatientId(p._id); setPatientName(p.name); setSearch(''); setShowSearch(false) }}
                          className="flex w-full items-center gap-3 p-3 hover:bg-surface-muted transition-colors text-left"
                        >
                          <Avatar name={p.name} size="sm" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                            <p className="text-xs text-foreground-muted">{p.phone || p.email}</p>
                          </div>
                        </button>
                      ))
                    ) : (
                      <p className="p-3 text-sm text-foreground-muted">No matching patients found</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground-secondary mb-1">Date & Time *</label>
            <input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground-secondary mb-1">Reason</label>
            <input type="text" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason for follow-up" className={inputClass} />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground-secondary mb-1">Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Additional notes" rows={3} className={inputClass} />
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t mt-6">
          <Button onClick={handleCreate} loading={createMutation.isPending} disabled={!patientId || !date} className="flex-1">
            Schedule
          </Button>
          <Button variant="outline" onClick={() => setCreateOpen(false)} className="flex-1">
            Cancel
          </Button>
        </div>
      </Dialog>
    </motion.div>
  )
}
