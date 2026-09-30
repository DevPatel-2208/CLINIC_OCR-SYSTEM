import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion'
import { useQuery } from '@tanstack/react-query'
import {
  Users, Phone, Stethoscope, ChevronRight, Search, SlidersHorizontal,
  ArrowUpDown, CalendarDays, UserCheck, Activity, ShieldCheck, LayoutGrid, List
} from 'lucide-react'
import { adminApi } from '../../services'
import { PageHeader, EmptyState, ErrorState } from '@/components/common'
import { Skeleton } from '@/components/ui'
import { fadeUp, staggerContainer, staggerItem } from '@/motion/variants'

function formatDoctorName(name) {
  if (!name) return 'Unassigned'
  const t = name.trim()
  return /^dr\.?\s+/i.test(t) ? t : `Dr. ${t}`
}

function initials(name) {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

const avatarTints = [
  { bg: 'bg-blue-50 dark:bg-blue-950/30', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800' },
  { bg: 'bg-teal-50 dark:bg-teal-950/30', text: 'text-teal-700 dark:text-teal-300', border: 'border-teal-200 dark:border-teal-800' },
  { bg: 'bg-purple-50 dark:bg-purple-950/30', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-800' },
  { bg: 'bg-amber-50 dark:bg-amber-950/30', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800' },
  { bg: 'bg-cyan-50 dark:bg-cyan-950/30', text: 'text-cyan-700 dark:text-cyan-300', border: 'border-cyan-200 dark:border-cyan-800' },
  { bg: 'bg-emerald-50 dark:bg-emerald-950/30', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800' },
]
function tintFor(str) {
  let h = 0
  for (let i = 0; i < (str || '').length; i++) h = (h * 31 + str.charCodeAt(i)) % avatarTints.length
  return avatarTints[h]
}

function PremiumAvatar({ name, size = 'md' }) {
  const t = tintFor(name)
  const dims = size === 'sm' ? 'w-9 h-9 text-xs' : 'w-10 h-10 text-sm'
  return (
    <div className={`${dims} rounded-xl flex items-center justify-center font-bold shrink-0 border ${t.bg} ${t.text} ${t.border}`}>
      {initials(name)}
    </div>
  )
}

function SummaryCard({ icon: Icon, label, value, sub, accent }) {
  const map = {
    blue: 'border-t-blue-500 bg-blue-50/50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    green: 'border-t-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    purple: 'border-t-purple-500 bg-purple-50/50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    amber: 'border-t-amber-500 bg-amber-50/50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  }
  const c = map[accent] || map.blue
  return (
    <motion.div variants={staggerItem} className={`rounded-[16px] border bg-surface p-4 sm:p-5 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 border-t-[3px] ${c} will-change-transform`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold tracking-widest uppercase text-foreground-muted">{label}</p>
          <p className="text-[28px] font-bold tracking-tight text-foreground leading-none mt-2">{value}</p>
          <p className="text-xs text-foreground-muted mt-1 leading-relaxed">{sub}</p>
        </div>
        <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${c}`}><Icon className="h-4.5 w-4.5" /></div>
      </div>
    </motion.div>
  )
}

export default function AdminPatients() {
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('recent')
  const [view, setView] = useState('list')
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-patients', search],
    queryFn: () => adminApi.getPatients({ search }).then((r) => r.data),
  })

  const raw = data?.data || []

  const patients = useMemo(() => {
    const arr = [...raw]
    if (sortBy === 'name-asc') arr.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    else if (sortBy === 'name-desc') arr.sort((a, b) => (b.name || '').localeCompare(a.name || ''))
    else arr.sort((a, b) => new Date(b.createdAt || b.updatedAt) - new Date(a.createdAt || a.updatedAt))
    return arr
  }, [raw, sortBy])

  const total = raw.length
  const active = raw.filter(p => !p.status || p.status === 'ACTIVE').length
  const doctorSet = new Set(raw.map(p => p.assignedDoctor?._id || p.assignedDoctor?.name).filter(Boolean))
  const doctorsCount = doctorSet.size
  const recent = raw.filter(p => {
    const d = new Date(p.createdAt || p.updatedAt)
    return Date.now() - d.getTime() < 7 * 24 * 60 * 60 * 1000
  }).length

  return (
    <motion.div initial={fadeUp.initial} animate={fadeUp.animate} transition={fadeUp.animate.transition} className="max-w-[1280px] mx-auto will-change-transform">
      <PageHeader
        eyebrow="Admin / Patient Management"
        accent="slate"
        title="Patients"
        description="Manage and review patient records across ClinicOCR."
      />

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: [0.16,1,0.3,1], delay: 0.06 }} className="rounded-[16px] border border-border bg-surface shadow-card p-3 sm:p-4 flex flex-col lg:flex-row gap-3 items-stretch lg:items-center will-change-transform">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by patient name or phone..."
            aria-label="Search patients"
            className="field-input w-full pl-10 pr-10 py-3 text-sm rounded-xl"
          />
          {search && (
            <button onClick={() => setSearch('')} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-surface-muted text-foreground-muted hover:text-foreground transition-colors">
              <span className="text-xs">✕</span>
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} aria-label="Sort patients" className="field-input pl-9 pr-8 py-3 text-sm rounded-xl appearance-none min-w-[160px]">
              <option value="recent">Recent first</option>
              <option value="name-asc">Name A → Z</option>
              <option value="name-desc">Name Z → A</option>
            </select>
            <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted pointer-events-none" />
          </div>
          <div className="hidden sm:flex items-center rounded-xl border border-border bg-surface-muted p-1">
            <button onClick={() => setView('list')} aria-label="List view" aria-pressed={view==='list'} className={`p-2 rounded-lg transition-colors ${view==='list' ? 'bg-surface shadow-sm border border-border text-foreground' : 'text-foreground-muted hover:text-foreground'}`}><List className="h-4 w-4" /></button>
            <button onClick={() => setView('cards')} aria-label="Cards view" aria-pressed={view==='cards'} className={`p-2 rounded-lg transition-colors ${view==='cards' ? 'bg-surface shadow-sm border border-border text-foreground' : 'text-foreground-muted hover:text-foreground'}`}><LayoutGrid className="h-4 w-4" /></button>
          </div>
        </div>
      </motion.div>

      <motion.div variants={staggerContainer(0.05)} initial="initial" animate="animate" className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <SummaryCard icon={Users} label="Total Patients" value={isLoading ? '—' : total} sub="All registered patients" accent="blue" />
        <SummaryCard icon={Activity} label="Active" value={isLoading ? '—' : active} sub="Currently active records" accent="green" />
        <SummaryCard icon={UserCheck} label="Doctors" value={isLoading ? '—' : doctorsCount} sub="Doctors with assigned patients" accent="purple" />
        <SummaryCard icon={CalendarDays} label="Recent" value={isLoading ? '—' : recent} sub="Added in last 7 days" accent="amber" />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.16,1,0.3,1], delay: 0.12 }} className="mt-6 rounded-[20px] border border-border bg-surface shadow-card overflow-hidden will-change-transform">
        <div className="px-4 sm:px-6 py-4 flex items-center justify-between gap-4 border-b border-border bg-surface-muted/40">
          <div><h2 className="text-sm font-semibold tracking-tight">Patient Registry</h2><p className="text-xs text-foreground-muted mt-0.5">{isLoading ? 'Loading…' : `Showing ${patients.length} patient${patients.length===1?'':'s'}${search ? ` matching “${search}”` : ''}`}</p></div>
          <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-semibold text-foreground-muted border border-border bg-surface rounded-full px-2.5 py-1"><ShieldCheck className="h-3 w-3" /> Physician-verified</span>
        </div>

        {isLoading ? (
          <div className="p-4 sm:p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-border-subtle bg-surface-muted/30">
                <Skeleton className="w-9 h-9 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2"><Skeleton className="h-3 w-32" /><Skeleton className="h-3 w-20" /></div>
                <Skeleton className="hidden sm:block h-8 w-24 rounded-xl" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="p-6"><ErrorState title="Unable to load patients" message="We couldn't retrieve the patient registry right now." onRetry={refetch} /></div>
        ) : patients.length === 0 ? (
          <div className="p-6">
            <EmptyState icon={Users} title={search ? 'No patients match your search' : 'No patients registered'} description={search ? `No records matching “${search}”. Try a different term or clear search.` : 'Patient records will appear here once created.'} className="py-10" />
            {search && <div className="flex justify-center mt-4"><button onClick={() => setSearch('')} className="px-4 py-2 rounded-xl border border-border bg-surface text-sm font-medium hover:bg-surface-muted transition-colors">Clear search</button></div>}
          </div>
        ) : (
          <>
            <div className={`${view==='cards' ? 'hidden' : 'hidden lg:block'} overflow-x-auto`}>
              <table className="w-full text-sm">
                <thead className="bg-surface-muted/60 border-b border-border">
                  <tr className="text-[11px] font-bold tracking-widest uppercase text-foreground-muted">
                    <th className="text-left px-6 py-3.5">Patient</th>
                    <th className="text-left px-4 py-3.5">Contact</th>
                    <th className="text-left px-4 py-3.5">Assigned Doctor</th>
                    <th className="text-left px-4 py-3.5">Status</th>
                    <th className="text-left px-4 py-3.5">Last Activity</th>
                    <th className="text-right px-6 py-3.5">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {patients.map((p) => {
                    const last = p.updatedAt || p.createdAt
                    return (
                      <tr key={p._id} className="group hover:bg-surface-muted/50 transition-colors duration-180">
                        <td className="px-6 py-4">
                          <Link to={`/admin/patients/${p._id}`} className="flex items-center gap-3 group/link">
                            <PremiumAvatar name={p.name} />
                            <span className="font-semibold text-foreground group-hover/link:text-primary-700 dark:group-hover/link:text-primary-300 transition-colors">{p.name}</span>
                          </Link>
                        </td>
                        <td className="px-4 py-4">
                          <a href={p.phone ? `tel:${p.phone}` : undefined} className={`inline-flex items-center gap-1.5 text-foreground-secondary ${p.phone ? 'hover:text-foreground' : ''} transition-colors`}>
                            <Phone className="h-3.5 w-3.5 text-foreground-muted" /> {p.phone || '—'}
                          </a>
                        </td>
                        <td className="px-4 py-4">
                          <span className="inline-flex items-center gap-1.5 text-foreground-secondary">
                            <Stethoscope className="h-3.5 w-3.5 text-foreground-muted" /> {formatDoctorName(p.assignedDoctor?.name)}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${!p.status || p.status==='ACTIVE' ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' : p.status==='PENDING' ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800' : 'bg-surface-muted text-foreground-muted border-border'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${!p.status || p.status==='ACTIVE' ? 'bg-emerald-500' : p.status==='PENDING' ? 'bg-amber-500' : 'bg-foreground-muted'}`} />{p.status || 'Active'}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-foreground-muted text-xs">{last ? new Date(last).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : '—'}</td>
                        <td className="px-6 py-4 text-right">
                          <Link to={`/admin/patients/${p._id}`} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border bg-surface text-xs font-semibold text-foreground hover:bg-surface-muted hover:border-primary-200 dark:hover:border-primary-700 transition-all group/btn">
                            View record <ChevronRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className={`${view==='cards' ? '' : 'lg:hidden'} p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4`}>
              {patients.map((p) => {
                const last = p.updatedAt || p.createdAt
                return (
                  <Link key={p._id} to={`/admin/patients/${p._id}`} className="group rounded-[16px] border border-border bg-surface p-4 sm:p-5 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 hover:border-primary-200 dark:hover:border-primary-700 transition-all duration-200 flex flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <PremiumAvatar name={p.name} size="sm" />
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground leading-tight truncate group-hover:text-primary-700 dark:group-hover:text-primary-300 transition-colors">{p.name}</p>
                          <p className="text-xs text-foreground-muted">Patient</p>
                        </div>
                      </div>
                      <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium border ${!p.status || p.status==='ACTIVE' ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' : 'bg-surface-muted text-foreground-muted border-border'}`}>{p.status || 'Active'}</span>
                    </div>
                    <div className="mt-4 grid grid-cols-1 gap-2.5 text-xs">
                      <div className="flex items-center gap-2 text-foreground-secondary"><Phone className="h-3.5 w-3.5 text-foreground-muted shrink-0" />{p.phone || '—'}</div>
                      <div className="flex items-center gap-2 text-foreground-secondary"><Stethoscope className="h-3.5 w-3.5 text-foreground-muted shrink-0" />{formatDoctorName(p.assignedDoctor?.name)} <span className="text-foreground-muted">• Doctor</span></div>
                      {last && <div className="flex items-center gap-2 text-foreground-muted"><CalendarDays className="h-3.5 w-3.5 shrink-0" />{new Date(last).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}</div>}
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <span className="text-xs text-foreground-muted">Tap to view</span>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary-700 dark:text-primary-300 group-hover:gap-1.5 transition-all">View record <ChevronRight className="h-3.5 w-3.5" /></span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  )
}
