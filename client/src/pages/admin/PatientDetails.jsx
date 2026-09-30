import { useQuery } from '@tanstack/react-query'
import { motion } from 'motion'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Phone, User, Stethoscope, MapPin, Droplets, Heart, ShieldCheck, CalendarDays, Mail, BadgeCheck } from 'lucide-react'
import { adminApi } from '../../services'
import { PageHeader, EmptyState, ErrorState } from '@/components/common'
import { Skeleton, Badge } from '@/components/ui'
import { fadeUp } from '@/motion/variants'

function initials(name) { return (name || '?').split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2) }
function formatDoctor(n){ if(!n) return 'Unassigned'; const t=n.trim(); return /^dr\.?\s+/i.test(t)?t:`Dr. ${t}` }
const tints = [
  { bg:'bg-blue-50 dark:bg-blue-950/30', text:'text-blue-700 dark:text-blue-300', border:'border-blue-200 dark:border-blue-800' },
  { bg:'bg-teal-50 dark:bg-teal-950/30', text:'text-teal-700 dark:text-teal-300', border:'border-teal-200 dark:border-teal-800' },
  { bg:'bg-purple-50 dark:bg-purple-950/30', text:'text-purple-700 dark:text-purple-300', border:'border-purple-200 dark:border-purple-800' },
  { bg:'bg-amber-50 dark:bg-amber-950/30', text:'text-amber-700 dark:text-amber-300', border:'border-amber-200 dark:border-amber-800' },
]
function tintFor(s){ let h=0; for(let i=0;i<(s||'').length;i++) h=(h*31+s.charCodeAt(i))%tints.length; return tints[h] }

export default function AdminPatientDetails() {
  const { id } = useParams()
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-patient', id],
    queryFn: () => adminApi.getPatientDetails(id).then((r) => r.data.data),
  })

  if (isLoading) {
    return <div className="max-w-[1280px] mx-auto"><Skeleton className="h-9 w-40 mb-6" /><Skeleton className="h-44 rounded-[20px] mb-6" /><Skeleton className="h-44 rounded-[20px]" /></div>
  }
  if (isError) return <div className="max-w-[1280px] mx-auto"><ErrorState title="Unable to load patient" message="We couldn't retrieve this patient's record. Please try again." onRetry={refetch} /></div>
  if (!data) return <div className="max-w-[1280px] mx-auto"><EmptyState title="Patient not found" description="This patient record may no longer exist." /></div>

  const t = tintFor(data.name)
  const infoItems = [
    { label: 'Phone', value: data.phone || 'Not provided', icon: Phone, href: data.phone ? `tel:${data.phone}` : undefined },
    { label: 'Email', value: data.email || 'Not provided', icon: Mail, href: data.email ? `mailto:${data.email}` : undefined },
    { label: 'Gender', value: data.gender || 'Not provided', icon: User },
    { label: 'Blood Group', value: data.bloodGroup || 'Not recorded', icon: Droplets },
    { label: 'Address', value: data.address || 'Not provided', icon: MapPin },
    { label: 'Patient ID', value: data.patientId || data._id?.slice(-8).toUpperCase() || '—', icon: BadgeCheck },
  ]

  return (
    <motion.div initial={fadeUp.initial} animate={fadeUp.animate} transition={fadeUp.animate.transition} className="max-w-[1280px] mx-auto will-change-transform">
      <Link to="/admin/patients" className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground-muted hover:text-primary-700 dark:hover:text-primary-300 transition-colors mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to Patients
      </Link>

      <PageHeader
        eyebrow="Admin / Patient / Record"
        accent="slate"
        title="Patient Record"
        description="Demographic and clinical details for this patient — auditable, read-only."
      />

      <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.35, ease:[0.16,1,0.3,1] }} className="rounded-[20px] border border-border bg-surface shadow-card overflow-hidden will-change-transform">
        <div className="h-1.5 bg-gradient-to-r from-blue-500 via-teal-500 to-cyan-500" />
        <div className="p-6 sm:p-7">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-[16px] flex items-center justify-center text-lg sm:text-xl font-bold shrink-0 border ${t.bg} ${t.text} ${t.border}`}>{initials(data.name)}</div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">{data.name}</h2>
              <p className="text-sm text-foreground-muted mt-1">Patient • {data.patientId || 'Registry'}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800">
                  <Stethoscope className="h-3.5 w-3.5" />{formatDoctor(data.assignedDoctor?.name)}
                </span>
                {data.gender && <Badge variant="info">{data.gender}</Badge>}
                {data.bloodGroup && <Badge variant="default"><Heart className="h-3 w-3 mr-1 text-error" />{data.bloodGroup}</Badge>}
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${!data.status || data.status==='ACTIVE' ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' : 'bg-surface-muted text-foreground-muted border-border'}`}>{data.status || 'Active'}</span>
              </div>
            </div>
            <div className="hidden sm:flex flex-col items-end gap-1 text-xs text-foreground-muted">
              <span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" />Created {data.createdAt ? new Date(data.createdAt).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}) : '—'}</span>
              <span className="inline-flex items-center gap-1"><ShieldCheck className="h-3 w-3 text-success" />Verified registry</span>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.35, ease:[0.16,1,0.3,1], delay:0.08 }} className="mt-6 rounded-[20px] border border-border bg-surface shadow-card overflow-hidden will-change-transform">
        <div className="px-6 py-4 border-b border-border bg-surface-muted/40 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Patient Details</h3>
          <span className="text-xs text-foreground-muted">Read-only • Admin view</span>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {infoItems.map((item) => (
            <div key={item.label} className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-surface-muted border border-border flex items-center justify-center shrink-0">
                <item.icon className="h-4 w-4 text-foreground-muted" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold tracking-widest uppercase text-foreground-muted">{item.label}</p>
                {item.href ? (
                  <a href={item.href} className="text-sm text-primary-700 dark:text-primary-300 hover:underline mt-0.5 break-words inline-block">{item.value}</a>
                ) : (
                  <p className="text-sm text-foreground mt-0.5 break-words leading-relaxed">{item.value}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <div className="mt-6 flex justify-between items-center">
        <Link to="/admin/patients" className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground-muted hover:text-primary-700 transition-colors"><ArrowLeft className="h-4 w-4" />Back to registry</Link>
        <Link to={`/admin/patients/${data._id}`} className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface border border-border text-sm font-medium hover:bg-surface-muted transition-colors">Open again <BadgeCheck className="h-4 w-4" /></Link>
      </div>
    </motion.div>
  )
}
