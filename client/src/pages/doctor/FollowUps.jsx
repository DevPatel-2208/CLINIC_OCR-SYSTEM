import { useState, useMemo, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useFollowUps, useCreateFollowUp, useUpdateFollowUp, useUpdateFollowUpStatus, useDeleteFollowUp } from '@/features/followups'
import { usePatientSearch } from '@/features/patients'
import { useDebounce } from '@/hooks/useDebounce'
import { PageHeader, EmptyState, ErrorState, StatusBadge, DateDisplay } from '@/components/common'
import { Skeleton, Button } from '@/components/ui'
import Dialog from '@/components/ui/Dialog'
import Pagination from '@/components/common/Pagination'
import { Plus, Calendar, CheckCircle2, User, Search, Filter, X, Clock, MoreVertical, Eye, Pencil, Trash2, CalendarCheck, CalendarX, AlertTriangle, Activity, SlidersHorizontal } from 'lucide-react'
import { cn } from '@/utils/cn'

const STATUS_FILTERS = [
  { value: '', label: 'All' },
  { value: 'UPCOMING', label: 'Upcoming' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'MISSED', label: 'Missed' },
]

const DATE_FILTERS = [
  { value: '', label: 'All dates' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
]

function getDateRange(preset) {
  const now = new Date()
  if (preset === 'today') {
    const start = new Date(now); start.setHours(0,0,0,0)
    const end = new Date(now); end.setHours(23,59,59,999)
    return { dateFrom: start.toISOString(), dateTo: end.toISOString() }
  }
  if (preset === 'week') {
    const start = new Date(now); start.setDate(now.getDate() - now.getDay()); start.setHours(0,0,0,0)
    const end = new Date(start); end.setDate(start.getDate()+6); end.setHours(23,59,59,999)
    return { dateFrom: start.toISOString(), dateTo: end.toISOString() }
  }
  if (preset === 'month') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    const end = new Date(now.getFullYear(), now.getMonth()+1, 0); end.setHours(23,59,59,999)
    return { dateFrom: start.toISOString(), dateTo: end.toISOString() }
  }
  return {}
}

function initials(name) { return name?.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase() || '?' }

function formatScheduled(date) {
  if (!date) return '—'
  const d = new Date(date)
  return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year:'numeric', hour:'2-digit', minute:'2-digit', hour12:true })
}

export default function DoctorFollowUps() {
  const navigate = useNavigate()
  const [searchInput, setSearchInput] = useState('')
  const debouncedSearch = useDebounce(searchInput, 350)
  const [statusFilter, setStatusFilter] = useState('')
  const [datePreset, setDatePreset] = useState('')
  const [sortBy, setSortBy] = useState('date')
  const [sortOrder, setSortOrder] = useState('desc')
  const [page, setPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const [modalMode, setModalMode] = useState(null)
  const [selected, setSelected] = useState(null)
  const [viewItem, setViewItem] = useState(null)
  const [confirmAction, setConfirmAction] = useState(null)

  const [form, setForm] = useState({ patientId: '', date: '', reason: '', notes: '' })
  const [patientQuery, setPatientQuery] = useState('')
  const debouncedPatientQuery = useDebounce(patientQuery, 300)
  const [patientOpen, setPatientOpen] = useState(false)
  const patientSearchRef = useRef(null)

  const dateRange = useMemo(() => getDateRange(datePreset), [datePreset])

  const queryParams = useMemo(() => ({
    search: debouncedSearch || undefined,
    status: statusFilter || undefined,
    dateFrom: dateRange.dateFrom,
    dateTo: dateRange.dateTo,
    sortBy, sortOrder,
    page, limit: 10,
  }), [debouncedSearch, statusFilter, dateRange, sortBy, sortOrder, page])

  const { data: result, isLoading, isError, refetch, isFetching } = useFollowUps(queryParams)
  const followUps = result?.data ?? (Array.isArray(result) ? result : [])
  const meta = result?.meta ?? { total: followUps.length, totalPages: 1, page: 1 }

  const { data: patientResults, isFetching: patientFetching } = usePatientSearch(debouncedPatientQuery)

  const createMutation = useCreateFollowUp()
  const updateMutation = useUpdateFollowUp()
  const statusMutation = useUpdateFollowUpStatus()
  const deleteMutation = useDeleteFollowUp()

  const allForStats = useFollowUps({}, { enabled: false })

  const stats = useMemo(() => {
    const list = followUps
    const todayStr = new Date().toDateString()
    return {
      upcoming: list.filter(f=>f.status==='UPCOMING').length,
      completed: list.filter(f=>f.status==='COMPLETED').length,
      missed: list.filter(f=>f.status==='MISSED').length,
      today: list.filter(f=> new Date(f.date).toDateString()===todayStr).length,
      total: meta.total ?? list.length,
    }
  }, [followUps, meta.total])

  useEffect(() => { setPage(1) }, [debouncedSearch, statusFilter, datePreset, sortBy, sortOrder])
  useEffect(() => {
    const handler = (e) => { if (patientSearchRef.current && !patientSearchRef.current.contains(e.target)) setPatientOpen(false) }
    document.addEventListener('mousedown', handler); return () => document.removeEventListener('mousedown', handler)
  }, [])

  const resetForm = () => { setForm({ patientId:'', date:'', reason:'', notes:'' }); setPatientQuery(''); setPatientOpen(false) }

  const openCreate = () => { resetForm(); setSelected(null); setModalMode('create') }
  const openEdit = (item) => {
    setSelected(item)
    const d = new Date(item.date)
    const pad = (n)=> String(n).padStart(2,'0')
    const local = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
    setForm({ patientId: item.patientId?._id || item.patientId || '', date: local, reason: item.reason||'', notes: item.notes||'' })
    setPatientQuery(item.patientId?.name || '')
    setModalMode('edit')
  }

  const validateForm = () => {
    if (!form.patientId) { toast.error('Select a patient'); return false }
    if (!form.date) { toast.error('Select date and time'); return false }
    const d = new Date(form.date)
    if (isNaN(d.getTime())) { toast.error('Invalid date'); return false }
    if (!form.reason.trim() || form.reason.trim().length < 2) { toast.error('Reason must be at least 2 characters'); return false }
    return true
  }

  const handleCreate = () => {
    if (!validateForm()) return
    const payload = { patientId: form.patientId, date: new Date(form.date).toISOString(), reason: form.reason.trim(), notes: form.notes.trim() }
    createMutation.mutate(payload, {
      onSuccess: () => { toast.success('Follow-up scheduled'); setModalMode(null); resetForm() },
      onError: (err)=> toast.error(err.response?.data?.message || 'Failed to create follow-up')
    })
  }

  const handleUpdate = () => {
    if (!validateForm()) return
    const payload = { patientId: form.patientId, date: new Date(form.date).toISOString(), reason: form.reason.trim(), notes: form.notes.trim() }
    updateMutation.mutate({ id: selected._id, data: payload }, {
      onSuccess: ()=> { toast.success('Follow-up updated'); setModalMode(null); resetForm(); setSelected(null) },
      onError: (err)=> toast.error(err.response?.data?.message || 'Failed to update')
    })
  }

  const handleStatus = (id, status, label) => {
    statusMutation.mutate({ id, status }, {
      onSuccess: ()=> toast.success(label || (status==='COMPLETED' ? 'Follow-up marked as completed.' : `Marked as ${status.toLowerCase()}`)),
      onError: (err)=> toast.error(err.response?.data?.message || 'Unable to complete this follow-up. Please try again.')
    })
  }

  const handleDelete = (id) => {
    deleteMutation.mutate(id, {
      onSuccess: ()=> { toast.success('Follow-up deleted'); setConfirmAction(null) },
      onError: (err)=> toast.error(err.response?.data?.message || 'Failed to delete')
    })
  }

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-4 w-96" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">{Array.from({length:4}).map((_,i)=><Skeleton key={i} className="h-24 rounded-xl" />)}</div>
        <Skeleton className="h-12 rounded-xl" />
        <div className="space-y-3">{Array.from({length:5}).map((_,i)=><Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      </div>
    )
  }
  if (isError) return <div className="max-w-5xl mx-auto"><ErrorState title="Unable to load follow-ups" message="We couldn't retrieve follow-up appointments. Please try again." onRetry={refetch} /></div>

  const hasFilters = !!(searchInput || statusFilter || datePreset)

  return (
    <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:0.28, ease:[0.16,1,0.3,1]}} className="max-w-6xl mx-auto space-y-6">
      <PageHeader
        eyebrow="Follow-ups"
        accent="teal"
        title="Follow-ups"
        description="Manage upcoming patient reviews, completed visits and follow-up appointments."
        action={<Button variant="primary" onClick={openCreate} leftIcon={Plus}>New Follow-up</Button>}
      />

      <motion.div initial="initial" animate="animate" variants={{ initial:{}, animate:{ transition:{ staggerChildren:0.06, delayChildren:0.04}}}} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label:'Upcoming', value: stats.upcoming, icon: Clock, tone:'bg-info-surface text-info border-info/20', surface:'surface-teal accent-top-teal' },
          { label:'Completed', value: stats.completed, icon: CheckCircle2, tone:'bg-success-surface text-success border-success/20', surface:'surface-green accent-top-green' },
          { label:'Today', value: stats.today, icon: CalendarCheck, tone:'bg-primary-50 text-primary-800 dark:bg-primary-50/15 dark:text-primary-100 border-primary/20', surface:'surface-blue accent-top-blue' },
          { label:'Missed', value: stats.missed, icon: AlertTriangle, tone:'bg-error-surface text-error border-error/20', surface:'surface-amber accent-top-amber' },
        ].map(card=> (
          <motion.div key={card.label} variants={{initial:{opacity:0,y:10}, animate:{opacity:1,y:0, transition:{duration:0.3, ease:[0.16,1,0.3,1]}}}} whileHover={{y:-2, transition:{duration:0.15}}} className={cn("card-surface p-4 flex items-center gap-3 will-change-transform", card.surface)}>
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border', card.tone)}><card.icon className="h-5 w-5" /></div>
            <div><p className="text-2xl font-bold tracking-tight text-foreground leading-none">{card.value}</p><p className="text-xs font-medium text-foreground-muted mt-0.5">{card.label}</p>{card.sub && <p className="text-[11px] text-foreground-muted">{card.sub}</p>}</div>
          </motion.div>
        ))}
      </motion.div>

      <div className="card-surface p-3 sm:p-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
            <input value={searchInput} onChange={e=>setSearchInput(e.target.value)} placeholder="Search patient or reason..." className="field-input pl-9 pr-9 py-2.5 text-sm" />
            {searchInput && <button onClick={()=>setSearchInput('')} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-surface-muted text-foreground-muted"><X className="h-4 w-4" /></button>}
          </div>
          <div className="hidden lg:flex items-center gap-2">
            <div className="flex items-center gap-1 p-1 bg-surface-muted rounded-xl border border-border">
              {STATUS_FILTERS.map(f=> (
                <button key={f.value} onClick={()=>setStatusFilter(f.value)} className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-colors', statusFilter===f.value?'bg-surface shadow-sm border border-border text-foreground':'text-foreground-muted hover:text-foreground')}>{f.label}</button>
              ))}
            </div>
            <select value={datePreset} onChange={e=>setDatePreset(e.target.value)} className="field-input py-2.5 px-3 text-sm min-w-[140px]">
              {DATE_FILTERS.map(f=> <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
            <select value={`${sortBy}-${sortOrder}`} onChange={e=>{ const [by,order]=e.target.value.split('-'); setSortBy(by); setSortOrder(order)}} className="field-input py-2.5 px-3 text-sm min-w-[150px]">
              <option value="date-desc">Date ↓ Newest</option>
              <option value="date-asc">Date ↑ Oldest</option>
              <option value="createdAt-desc">Created ↓</option>
              <option value="status-asc">Status A→Z</option>
            </select>
          </div>
          <Button variant="outline" onClick={()=>setShowFilters(v=>!v)} className="lg:hidden w-full" leftIcon={SlidersHorizontal}><Filter className="h-4 w-4" /> Filters {hasFilters && <span className="ml-1 bg-primary text-white text-[10px] px-1.5 py-0.5 rounded-full">{[searchInput, statusFilter, datePreset].filter(Boolean).length}</span>}</Button>
        </div>
        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} exit={{opacity:0, height:0}} className="lg:hidden overflow-hidden">
              <div className="pt-3 mt-3 border-t border-border grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-foreground-secondary">Status</label><select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} className="field-input mt-1 py-2.5 px-3 text-sm">{STATUS_FILTERS.map(f=><option key={f.value} value={f.value}>{f.label}</option>)}</select></div>
                <div><label className="text-xs font-medium text-foreground-secondary">Date</label><select value={datePreset} onChange={e=>setDatePreset(e.target.value)} className="field-input mt-1 py-2.5 px-3 text-sm">{DATE_FILTERS.map(f=><option key={f.value} value={f.value}>{f.label}</option>)}</select></div>
                <div className="col-span-2"><label className="text-xs font-medium text-foreground-secondary">Sort</label><select value={`${sortBy}-${sortOrder}`} onChange={e=>{const [by,o]=e.target.value.split('-'); setSortBy(by); setSortOrder(o)}} className="field-input mt-1 py-2.5 px-3 text-sm"><option value="date-desc">Date newest</option><option value="date-asc">Date oldest</option><option value="createdAt-desc">Created</option></select></div>
                {hasFilters && <button onClick={()=>{setSearchInput(''); setStatusFilter(''); setDatePreset('')}} className="col-span-2 text-sm text-primary font-medium">Clear filters</button>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {isFetching && <p className="text-xs text-foreground-muted mt-2">Updating results…</p>}
      </div>

      {followUps.length===0 ? (
        <div className="card-surface">
          {hasFilters ? (
            <EmptyState icon={Search} title="No matching follow-ups" description="Try adjusting search or filters." action={<Button variant="outline" onClick={()=>{setSearchInput('');setStatusFilter('');setDatePreset('')}}>Clear Filters</Button>} className="py-10" />
          ) : (
            <EmptyState icon={Calendar} title="No follow-ups yet" description="Create a follow-up to keep track of upcoming patient reviews." action={<Button variant="primary" onClick={openCreate} leftIcon={Plus}>New Follow-up</Button>} className="py-14" />
          )}
        </div>
      ) : (
        <>
          <div className="hidden sm:block card-surface overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-surface-muted"><tr className="text-left text-xs text-foreground-muted uppercase tracking-wide border-b border-border"><th className="px-5 py-3 font-medium">Patient</th><th className="px-5 py-3 font-medium">Reason</th><th className="px-5 py-3 font-medium">Scheduled</th><th className="px-5 py-3 font-medium">Status</th><th className="px-5 py-3 font-medium text-right w-[168px] min-w-[168px]">Actions</th></tr></thead>
                <tbody>
                  {followUps.map(f=> (
                    <tr key={f._id} className="border-b border-border-subtle last:border-0 hover:bg-surface-muted/60 transition-colors">
                      <td className="px-5 py-3.5">
                        <button onClick={()=> navigate(`/doctor/patients/${f.patientId?._id}`)} className="flex items-center gap-3 text-left group">
                          <span className="w-9 h-9 rounded-full bg-primary-50 text-primary-700 dark:bg-primary-50/15 dark:text-primary-300 flex items-center justify-center text-xs font-bold shrink-0">{initials(f.patientId?.name)}</span>
                          <span><span className="block text-sm font-medium text-foreground group-hover:text-primary transition-colors">{f.patientId?.name || 'Unknown'}</span><span className="block text-xs text-foreground-muted">{f.patientId?.patientId || f.patientId?.phone || ''}</span></span>
                        </button>
                      </td>
                      <td className="px-5 py-3.5"><span className="text-foreground-secondary line-clamp-1 max-w-[220px]">{f.reason || '—'}</span>{f.notes && <span className="text-xs text-foreground-muted line-clamp-1">{f.notes}</span>}</td>
                      <td className="px-5 py-3.5 text-foreground-secondary whitespace-nowrap">{formatScheduled(f.date)}</td>
                      <td className="px-5 py-3.5"><StatusBadge status={f.status} /></td>
                      <td className="px-5 py-3.5">
                        <div className="flex justify-end items-center gap-1 min-w-[148px]">
                          <button onClick={()=>setViewItem(f)} className="p-2 rounded-lg hover:bg-surface-muted text-foreground-muted hover:text-foreground transition-colors shrink-0 min-h-[36px] min-w-[36px] flex items-center justify-center" title="View" aria-label="View follow-up"><Eye className="h-4 w-4" /></button>
                          {f.status==='UPCOMING' ? (
                            <>
                              <Button size="sm" variant="primary" onClick={()=>setConfirmAction({type:'complete', item:f})} disabled={statusMutation.isPending} className="shrink-0 whitespace-nowrap"><CheckCircle2 className="h-3.5 w-3.5" /> Complete</Button>
                              <ActionsMenu item={f} onEdit={()=>openEdit(f)} onCancel={()=>setConfirmAction({type:'cancel', item:f})} onDelete={()=>setConfirmAction({type:'delete', item:f})} onView={()=>setViewItem(f)} />
                            </>
                          ) : (
                            <ActionsMenu item={f} onEdit={()=>openEdit(f)} onCancel={null} onDelete={()=>setConfirmAction({type:'delete', item:f})} onView={()=>setViewItem(f)} />
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="sm:hidden space-y-3">
            <AnimatePresence>
              {followUps.map(f=> (
                <motion.div key={f._id} initial={{opacity:0, y:8}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="card-surface p-4">
                  <div className="flex items-start justify-between gap-3">
                    <button onClick={()=> navigate(`/doctor/patients/${f.patientId?._id}`)} className="flex items-center gap-2.5 text-left min-w-0">
                      <span className="w-9 h-9 rounded-full bg-primary-50 text-primary-700 flex items-center justify-center text-xs font-bold shrink-0">{initials(f.patientId?.name)}</span>
                      <span className="min-w-0"><span className="block text-sm font-semibold text-foreground truncate">{f.patientId?.name || 'Unknown'}</span><span className="block text-xs text-foreground-muted truncate">{f.patientId?.patientId || f.patientId?.phone || ''}</span><span className="block text-xs text-foreground-muted truncate">{f.reason || 'No reason'}</span></span>
                    </button>
                    <StatusBadge status={f.status} />
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-foreground-muted"><Calendar className="h-3.5 w-3.5" />{formatScheduled(f.date)}</div>
                  {f.notes && <p className="text-xs text-foreground-muted mt-1 line-clamp-2">{f.notes}</p>}
                  <div className="mt-3 pt-3 border-t border-border-subtle flex gap-2">
                    {f.status==='UPCOMING' ? (
                      <>
                        <Button size="sm" variant="secondary" className="flex-1" onClick={()=>setConfirmAction({type:'complete', item:f})}><CheckCircle2 className="h-3.5 w-3.5" /> Complete</Button>
                        <Button size="sm" variant="outline" onClick={()=>setViewItem(f)}><Eye className="h-3.5 w-3.5" /> View</Button>
                        <ActionsMenu mobile item={f} onEdit={()=>openEdit(f)} onCancel={()=>setConfirmAction({type:'cancel', item:f})} onDelete={()=>setConfirmAction({type:'delete', item:f})} onView={()=>setViewItem(f)} />
                      </>
                    ) : (
                      <>
                        <Button size="sm" variant="outline" className="flex-1" onClick={()=>setViewItem(f)} leftIcon={Eye}>View</Button>
                        <ActionsMenu mobile item={f} onEdit={()=>openEdit(f)} onDelete={()=>setConfirmAction({type:'delete', item:f})} onView={()=>setViewItem(f)} />
                      </>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {meta.totalPages > 1 && <Pagination currentPage={meta.page} totalPages={meta.totalPages} onPageChange={setPage} className="pt-2" />}
        </>
      )}

      <Dialog open={!!modalMode} onClose={()=>{setModalMode(null); resetForm()}} title={modalMode==='edit' ? 'Edit Follow-up' : 'New Follow-up'} description={modalMode==='edit' ? 'Update the scheduled follow-up.' : 'Schedule a follow-up for a patient.'} size="lg"
        footer={<><Button variant="outline" onClick={()=>{setModalMode(null); resetForm()}}>Cancel</Button><Button variant="primary" onClick={modalMode==='edit'? handleUpdate : handleCreate} loading={createMutation.isPending || updateMutation.isPending}>{modalMode==='edit' ? 'Save Changes' : 'Create Follow-up'}</Button></>}
      >
        <div className="grid grid-cols-1 gap-4">
          <div className="relative" ref={patientSearchRef}>
            <label className="field-label">Patient <span className="text-error">*</span></label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
              <input value={patientQuery} onChange={e=>{setPatientQuery(e.target.value); setForm(f=>({...f, patientId:''})); setPatientOpen(true)}} onFocus={()=>setPatientOpen(true)} placeholder="Search patient by name or phone..." className="field-input pl-9 pr-3 py-2.5 text-sm" />
              {patientFetching && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-foreground-muted">Searching…</span>}
            </div>
            {form.patientId && <p className="text-xs text-success mt-1 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Patient selected</p>}
            <AnimatePresence>
              {patientOpen && debouncedPatientQuery.length>1 && (
                <motion.div initial={{opacity:0,y:-4, scale:0.98}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:-4}} className="absolute z-20 mt-1 w-full bg-surface border border-border rounded-xl shadow-dropdown max-h-56 overflow-y-auto">
                  {patientResults?.length===0 && <p className="px-3 py-3 text-sm text-foreground-muted">No matching patients</p>}
                  {patientResults?.map(p=> (
                    <button key={p._id} onClick={()=>{setForm(f=>({...f, patientId:p._id})); setPatientQuery(`${p.name} · ${p.phone|| p.patientId||''}`); setPatientOpen(false)}} className="w-full text-left px-3 py-2.5 hover:bg-surface-muted text-sm flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-primary-50 text-primary-700 flex items-center justify-center text-xs font-bold">{initials(p.name)}</span>
                      <span><span className="block font-medium text-foreground">{p.name}</span><span className="block text-xs text-foreground-muted">{p.phone} {p.patientId? `· ${p.patientId}`:''}</span></span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div>
            <label className="field-label">Reason <span className="text-error">*</span></label>
            <input value={form.reason} onChange={e=>setForm({...form, reason:e.target.value})} placeholder="e.g. Review blood work, suture removal" className="field-input px-3 py-2.5 text-sm" maxLength={200} />
          </div>

          <div>
            <label className="field-label">Date & Time <span className="text-error">*</span></label>
            <input type="datetime-local" value={form.date} onChange={e=>setForm({...form, date:e.target.value})} className="field-input px-3 py-2.5 text-sm" />
            <p className="field-hint">Stored as UTC, displayed in local time.</p>
          </div>

          <div>
            <label className="field-label">Notes (optional)</label>
            <textarea value={form.notes} onChange={e=>setForm({...form, notes:e.target.value})} placeholder="Clinical notes for the follow-up" rows={3} className="field-input px-3 py-2.5 text-sm resize-none" maxLength={1000} />
          </div>
        </div>
      </Dialog>

      <Dialog open={!!viewItem} onClose={()=>setViewItem(null)} title="Follow-up Details" size="md"
        footer={<Button variant="outline" onClick={()=>setViewItem(null)}>Close</Button>}
      >
        {viewItem && (
          <div className="space-y-4 text-sm">
            <div className="flex items-center gap-3 p-3 bg-surface-muted rounded-xl border border-border">
              <span className="w-10 h-10 rounded-full bg-primary-50 text-primary-700 flex items-center justify-center text-sm font-bold">{initials(viewItem.patientId?.name)}</span>
              <div><p className="font-semibold text-foreground">{viewItem.patientId?.name}</p><p className="text-xs text-foreground-muted">{viewItem.patientId?.phone} {viewItem.patientId?.patientId? `· ${viewItem.patientId.patientId}`:''}</p></div>
              <StatusBadge status={viewItem.status} className="ml-auto" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><p className="text-xs text-foreground-muted">Scheduled</p><p className="font-medium text-foreground">{formatScheduled(viewItem.date)}</p></div>
              <div><p className="text-xs text-foreground-muted">Doctor</p><p className="font-medium text-foreground">{viewItem.doctorId?.name || '—'}</p></div>
              <div className="col-span-2"><p className="text-xs text-foreground-muted">Reason</p><p className="font-medium text-foreground">{viewItem.reason || '—'}</p></div>
              {viewItem.notes && <div className="col-span-2"><p className="text-xs text-foreground-muted">Notes</p><p className="text-foreground-secondary">{viewItem.notes}</p></div>}
              <div><p className="text-xs text-foreground-muted">Created</p><p className="text-foreground-secondary"><DateDisplay date={viewItem.createdAt} format="dd MMM yyyy HH:mm" /></p></div>
              {viewItem.completedAt && <div><p className="text-xs text-foreground-muted">Completed</p><p className="text-foreground-secondary"><DateDisplay date={viewItem.completedAt} format="dd MMM yyyy HH:mm" /></p></div>}
              {viewItem.cancelledAt && <div><p className="text-xs text-foreground-muted">Cancelled</p><p className="text-foreground-secondary"><DateDisplay date={viewItem.cancelledAt} format="dd MMM yyyy HH:mm" /></p></div>}
            </div>
          </div>
        )}
      </Dialog>

      <Dialog open={!!confirmAction} onClose={()=>{ if(!statusMutation.isPending && !deleteMutation.isPending) setConfirmAction(null)}} title={confirmAction?.type==='complete'?'Mark follow-up as completed?':confirmAction?.type==='cancel'?'Cancel follow-up?':'Delete follow-up?'} description={confirmAction?.type==='complete'?'Are you sure you want to mark this follow-up as completed?':confirmAction?.type==='cancel'?'Are you sure you want to cancel this follow-up? This preserves history.':'This action cannot be undone.'} size="sm"
        footer={<><Button variant="outline" onClick={()=>setConfirmAction(null)} disabled={statusMutation.isPending || deleteMutation.isPending}>Cancel</Button><Button variant={confirmAction?.type==='delete'?'danger':'primary'} loading={statusMutation.isPending || deleteMutation.isPending} onClick={()=>{
          if(confirmAction?.type==='complete') { handleStatus(confirmAction.item._id,'COMPLETED','Follow-up marked as completed.'); setTimeout(()=>setConfirmAction(null), 300) }
          else if(confirmAction?.type==='cancel') { handleStatus(confirmAction.item._id,'CANCELLED','Follow-up cancelled'); setTimeout(()=>setConfirmAction(null), 300) }
          else if(confirmAction?.type==='delete') handleDelete(confirmAction.item._id)
        }}>{statusMutation.isPending && confirmAction?.type==='complete' ? 'Completing...' : confirmAction?.type==='complete'?'Mark as Completed':confirmAction?.type==='cancel'?'Cancel Follow-up':'Delete'}</Button></>}
      >
        {confirmAction && <p className="text-sm text-foreground-secondary"><span className="font-medium text-foreground">{confirmAction.item.patientId?.name}</span> — {formatScheduled(confirmAction.item.date)}</p>}
      </Dialog>
    </motion.div>
  )
}

function ActionsMenu({ item, onEdit, onCancel, onDelete, onView, mobile }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(()=>{ const h=(e)=>{ if(ref.current && !ref.current.contains(e.target)) setOpen(false)}; document.addEventListener('mousedown', h); return ()=>document.removeEventListener('mousedown',h)},[])
  return (
    <div className="relative" ref={ref}>
      <button onClick={()=>setOpen(v=>!v)} className={cn('p-1.5 rounded-lg hover:bg-surface-muted text-foreground-muted hover:text-foreground', mobile && 'border border-border')} aria-label="More actions"><MoreVertical className="h-4 w-4" /></button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{opacity:0, scale:0.98, y:-4}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0, scale:0.98}} className="absolute right-0 mt-1 w-44 bg-surface border border-border rounded-xl shadow-dropdown overflow-hidden z-20 py-1">
            <button onClick={()=>{setOpen(false); onView?.()}} className="w-full text-left px-3 py-2 text-sm hover:bg-surface-muted flex items-center gap-2"><Eye className="h-4 w-4" /> View</button>
            <button onClick={()=>{setOpen(false); onEdit?.()}} className="w-full text-left px-3 py-2 text-sm hover:bg-surface-muted flex items-center gap-2"><Pencil className="h-4 w-4" /> Edit</button>
            {onCancel && <button onClick={()=>{setOpen(false); onCancel()}} className="w-full text-left px-3 py-2 text-sm hover:bg-surface-muted flex items-center gap-2 text-warning"><CalendarX className="h-4 w-4" /> Cancel</button>}
            <button onClick={()=>{setOpen(false); onDelete?.()}} className="w-full text-left px-3 py-2 text-sm hover:bg-error-surface text-error flex items-center gap-2"><Trash2 className="h-4 w-4" /> Delete</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
