import { useParams, Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { motion, AnimatePresence } from 'motion'
import {
  usePatient, usePatientPrescriptions, usePatientMedicines, usePatientFollowUps,
} from '@/features/patients'
import { useTreatmentTimeline } from '@/features/timeline'
import { PageHeader, SectionCard, EmptyState, ErrorState, StatusBadge, DateDisplay } from '@/components/common'
import { Skeleton, Tabs } from '@/components/ui'
import { fadeUp, fadeScale, staggerContainer, staggerItem } from '@/motion/variants'
import {
  ArrowLeft, Plus, FileText, Pill, Phone, Calendar, Mail, Upload, Sparkles, Activity, User,
  MessageSquareText, FileDown, MapPin,
} from 'lucide-react'
import { calculateAge } from '@/features/patients'

export default function DoctorPatientProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')

  const { data: patient, isLoading, isError, refetch } = usePatient(id)
  const { data: prescriptions, isLoading: rxLoading } = usePatientPrescriptions(id)
  const { data: medicines, isLoading: medLoading } = usePatientMedicines(id)
  const { data: timeline, isLoading: tlLoading } = useTreatmentTimeline(id)
  const { data: followUps, isLoading: fuLoading } = usePatientFollowUps(id)

  if (isLoading) {
    return (
      <div>
        <Skeleton className="h-9 w-40 mb-6" />
        <Skeleton className="h-40 rounded-xl mb-6" />
        <Skeleton className="h-56 rounded-xl" />
      </div>
    )
  }

  if (isError) return <ErrorState title="Unable to load patient" message="Please try again." onRetry={refetch} />
  if (!patient) return <EmptyState title="Patient not found" />

  const age = calculateAge(patient.dateOfBirth)

  const tabs = [
    { value: 'overview', label: 'Overview', icon: User },
    { value: 'prescriptions', label: 'Prescriptions', icon: FileText },
    { value: 'medicines', label: 'Medicines', icon: Pill },
    { value: 'timeline', label: 'Timeline', icon: Activity },
    { value: 'followups', label: 'Follow-ups', icon: Calendar },
  ]

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div initial={fadeUp.initial} animate={fadeUp.animate} transition={fadeUp.animate.transition} className="mb-6 flex flex-wrap items-center gap-2 will-change-transform">
        <Link to="/doctor/patients" className="p-2 text-foreground-muted hover:bg-surface-muted rounded-lg">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <PageHeader eyebrow="Patient Record" accent="blue" title="Patient 360°" description="Complete clinical record and history" breadcrumbs={[{ label: 'Patients', href: '/doctor/patients' }, { label: patient.name }]} />
      </motion.div>

      <motion.div initial={fadeScale.initial} animate={fadeScale.animate} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1], delay: 0.08 }} className="card-surface surface-blue accent-top-blue p-6 sm:p-8 mb-6 will-change-transform">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1], delay: 0.12 }} className="w-16 h-16 icon-box-blue rounded-2xl flex items-center justify-center text-xl font-bold shrink-0 shadow-sm will-change-transform">
            {patient.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
          </motion.div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-foreground">{patient.name}</h2>
            <motion.div variants={staggerContainer(0.04)} initial="initial" animate="animate" className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-foreground-muted">
              <motion.span variants={staggerItem} className="inline-flex items-center gap-1 will-change-transform"><Phone className="h-3.5 w-3.5" /> {patient.phone || 'N/A'}</motion.span>
              {patient.email && <motion.span variants={staggerItem} className="inline-flex items-center gap-1 will-change-transform"><Mail className="h-3.5 w-3.5" /> {patient.email}</motion.span>}
              <motion.span variants={staggerItem} className="inline-flex items-center gap-1 will-change-transform"><User className="h-3.5 w-3.5" /> {patient.gender || 'Gender N/A'}</motion.span>
              {age != null && <motion.span variants={staggerItem} className="will-change-transform">{age} years</motion.span>}
              <motion.span variants={staggerItem} className="inline-flex items-center gap-1 will-change-transform"><MapPin className="h-3.5 w-3.5" /> {patient.address || 'Address N/A'}</motion.span>
              {patient.bloodGroup && <motion.span variants={staggerItem} className="inline-flex items-center gap-1 will-change-transform">Blood: {patient.bloodGroup}</motion.span>}
            </motion.div>
            <motion.div variants={staggerContainer(0.04)} initial="initial" animate="animate" className="mt-3 flex items-center gap-2">
              <motion.span variants={staggerItem} className="inline-flex items-center gap-1.5 text-xs text-foreground-muted bg-surface-muted border border-border rounded-lg px-2.5 py-1 will-change-transform">
                <FileText className="h-3 w-3" /> {patient.prescriptionCount || (prescriptions?.length || 0)} prescriptions
              </motion.span>
              {patient.assignedDoctor?.name && (
                <motion.span variants={staggerItem} className="inline-flex items-center gap-1.5 text-xs text-foreground-muted bg-surface-muted border border-border rounded-lg px-2.5 py-1 will-change-transform">
                  <Sparkles className="h-3 w-3 text-secondary-600" /> Dr. {patient.assignedDoctor.name}
                </motion.span>
              )}
            </motion.div>
          </div>
        </div>

        <motion.div variants={staggerContainer(0.04)} initial="initial" animate="animate" className="flex flex-wrap gap-2 mt-5 pt-5 border-t border-border-subtle">
              <motion.button variants={staggerItem} onClick={() => navigate(`/doctor/prescriptions/upload?patient=${patient._id}`)} className="inline-flex items-center gap-2 px-3.5 py-2 bg-primary-800 text-white text-sm font-medium rounded-lg hover:bg-primary-900 dark:bg-primary dark:hover:bg-primary-hover shadow-sm will-change-transform">
            <Upload className="h-4 w-4" /> Upload Prescription
          </motion.button>
          <motion.div variants={staggerItem} className="will-change-transform">
            <Link to={`/doctor/ai-assistant`} className="inline-flex items-center gap-2 px-3.5 py-2 border border-border text-foreground-secondary text-sm font-medium rounded-lg hover:bg-surface-muted">
              <MessageSquareText className="h-4 w-4" /> AI Assistant
            </Link>
          </motion.div>
          <motion.button variants={staggerItem} onClick={() => navigate(`/doctor/patients/${patient._id}/timeline`)} className="inline-flex items-center gap-2 px-3.5 py-2 border border-border text-foreground-secondary text-sm font-medium rounded-lg hover:bg-surface-muted will-change-transform">
            <Activity className="h-4 w-4" /> View Timeline
          </motion.button>
        </motion.div>
      </motion.div>

      <motion.div initial={fadeScale.initial} animate={fadeScale.animate} transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1], delay: 0.14 }} className="card-surface overflow-hidden will-change-transform">
        <div className="px-5 pt-3 overflow-x-auto scrollbar-hide">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        </div>
        <div className="p-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="will-change-transform"
            >
              {activeTab === 'overview' && (
                <OverviewTab prescriptions={prescriptions} medicines={medicines} followUps={followUps} patientId={patient._id} loading={rxLoading || medLoading} />
              )}
              {activeTab === 'prescriptions' && (
                <PrescriptionsTab prescriptions={prescriptions} patientId={patient._id} loading={rxLoading} />
              )}
              {activeTab === 'medicines' && (
                <MedicinesTab medicines={medicines} loading={medLoading} />
              )}
              {activeTab === 'timeline' && (
                <TimelineTab timeline={timeline} patientId={patient._id} loading={tlLoading} />
              )}
              {activeTab === 'followups' && (
                <FollowUpsTab followUps={followUps} patientId={patient._id} loading={fuLoading} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}

function OverviewTab({ prescriptions, medicines, followUps, patientId, loading }) {
  if (loading) return <div className="space-y-3"><Skeleton className="h-16 rounded-xl" /><Skeleton className="h-16 rounded-xl" /><Skeleton className="h-10 rounded-xl" /></div>
  return (
    <div className="space-y-6">
      <SectionCard title="Recent Prescriptions" description="Latest clinical prescriptions" icon={FileText} tint="blue" iconBg="icon-box-blue" iconColor="text-[var(--icon-blue)]">
        {prescriptions?.slice(0, 5).length ? (
          <motion.div variants={staggerContainer(0.03)} initial="initial" animate="animate" className="space-y-2">
            {prescriptions.slice(0, 5).map((p) => (
              <motion.div key={p._id} variants={staggerItem} className="will-change-transform">
                <Link
                  to={`/doctor/prescriptions/${p._id}`}
                  className="block p-3 bg-surface-muted border border-border rounded-xl hover:bg-surface hover:border-primary/15 transition-colors"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-foreground truncate">
                      {p.ai?.summary?.substring(0, 60) || 'Prescription'}
                    </p>
                    <StatusBadge status={p.processingStatus} />
                  </div>
                  <p className="text-xs text-foreground-muted mt-1">
                    <DateDisplay date={p.prescriptionDate} format="dd MMM yyyy" />
                  </p>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <EmptyState
            title="No prescriptions yet"
            description="Upload the patient's first prescription to begin OCR and AI extraction."
            action={<Link to={`/doctor/prescriptions/upload?patient=${patientId}`} className="inline-flex items-center gap-2 px-3.5 py-2 bg-primary-800 text-white text-sm font-medium rounded-lg dark:bg-primary dark:text-white">Upload Prescription</Link>}
            className="py-8"
          />
        )}
      </SectionCard>

      <SectionCard title="Current Medicines" description="Active medicines for this patient" icon={Pill}>
        {medicines && Object.keys(medicines).length > 0 ? (
          <motion.div variants={staggerContainer(0.04)} initial="initial" animate="animate" className="flex flex-wrap gap-2">
            {Object.keys(medicines).slice(0, 8).map((name) => (
              <motion.span key={name} variants={staggerItem} className="inline-flex items-center gap-1.5 text-xs bg-[var(--surface-teal)] text-[var(--icon-teal)] border border-[var(--border-teal)] rounded-lg px-2.5 py-1.5 will-change-transform">
                <Pill className="h-3 w-3" /> {name}
              </motion.span>
            ))}
          </motion.div>
        ) : (
          <EmptyState title="No medicine history" className="py-6" />
        )}
      </SectionCard>
    </div>
  )
}

function PrescriptionsTab({ prescriptions, patientId, loading }) {
  if (loading) return <div className="space-y-2"><Skeleton className="h-14 rounded-xl" /><Skeleton className="h-14 rounded-xl" /><Skeleton className="h-14 rounded-xl" /></div>
  if (!prescriptions || prescriptions.length === 0) {
    return (
      <EmptyState
        title="No prescriptions recorded"
        description="Upload a prescription to begin processing."
        action={<Link to={`/doctor/prescriptions/upload?patient=${patientId}`} className="inline-flex items-center gap-2 px-3.5 py-2 bg-primary-800 text-white text-sm font-medium rounded-lg dark:bg-primary dark:text-white"><Plus className="h-4 w-4" /> Upload Prescription</Link>}
      />
    )
  }
  return (
    <motion.div variants={staggerContainer(0.03)} initial="initial" animate="animate" className="space-y-2">
      {prescriptions.map((p) => (
        <motion.div key={p._id} variants={staggerItem} className="will-change-transform">
          <Link
            to={`/doctor/prescriptions/${p._id}`}
            className="flex items-center justify-between p-3 bg-surface-muted rounded-xl hover:bg-surface-muted transition-colors gap-2 min-w-0">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground truncate">{p.ai?.summary?.substring(0, 60) || 'Prescription'}</p>
              <p className="text-xs text-foreground-muted mt-0.5"><DateDisplay date={p.prescriptionDate} format="dd MMM yyyy" /></p>
            </div>
            <StatusBadge status={p.processingStatus} className="shrink-0" />
          </Link>
        </motion.div>
      ))}
    </motion.div>
  )
}

function MedicinesTab({ medicines, loading }) {
  if (loading) return <div className="space-y-2"><Skeleton className="h-14 rounded-xl" /><Skeleton className="h-14 rounded-xl" /></div>
  if (!medicines || Object.keys(medicines).length === 0) {
    return <EmptyState title="No medicine history" description="Medicines prescribed to this patient will appear here." />
  }
  return (
    <motion.div variants={staggerContainer(0.03)} initial="initial" animate="animate" className="space-y-3">
      {Object.entries(medicines).map(([name, entries]) => (
        <motion.div key={name} variants={staggerItem} className="flex items-center justify-between p-3 bg-surface-muted rounded-xl will-change-transform">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 bg-[var(--surface-teal)] text-[var(--icon-teal)] rounded-lg flex items-center justify-center shrink-0">
              <Pill className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{name}</p>
              <p className="text-xs text-foreground-muted">
                First recorded: {entries[0]?.date ? <DateDisplay date={entries[0].date} format="dd MMM" /> : 'N/A'}
              </p>
            </div>
          </div>
          <motion.span initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }} className="text-xs text-foreground-muted bg-surface border border-border rounded-lg px-2 py-1 will-change-transform">
            {entries.length} record{entries.length > 1 ? 's' : ''}
          </motion.span>
        </motion.div>
      ))}
    </motion.div>
  )
}

function TimelineTab({ timeline, patientId, loading }) {
  if (loading) return <div className="space-y-2"><Skeleton className="h-12 rounded-xl" /><Skeleton className="h-12 rounded-xl" /></div>
  if (!timeline || timeline.length === 0) {
    return <EmptyState icon={Activity} title="No timeline events" description="Clinical events will appear as they are recorded." />
  }
  return (
    <SectionCard title="Treatment Timeline" description={`${timeline.length} events recorded`} icon={Activity} tint="cyan" iconBg="icon-box-cyan" iconColor="text-[var(--icon-cyan)]">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }} className="will-change-transform">
        <motion.div variants={staggerContainer(0.03)} initial="initial" animate="animate" className="space-y-2">
          {timeline.slice(0, 4).map((event, i) => (
            <motion.div key={i} variants={staggerItem} className="p-3 bg-surface-muted border border-border rounded-xl flex items-center justify-between will-change-transform">
              <p className="text-sm font-medium text-foreground">{event.title || event.type}</p>
              <span className="text-xs text-foreground-muted"><DateDisplay date={event.date} format="dd MMM yyyy" /></span>
            </motion.div>
          ))}
        </motion.div>
        <div className="relative mt-4">
          <motion.div initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} style={{ originY: 0 }} className="absolute left-[7px] top-0 bottom-0 w-px bg-border will-change-transform" aria-hidden="true" />
          <Link to={`/doctor/patients/${patientId}/timeline`} className="relative inline-flex items-center gap-2 px-3.5 py-2 bg-primary-800 text-white text-sm font-medium rounded-lg dark:bg-primary dark:text-white">
            <Activity className="h-4 w-4" /> Open Full Timeline
          </Link>
        </div>
      </motion.div>
    </SectionCard>
  )
}

function FollowUpsTab({ followUps, patientId, loading }) {
  if (loading) return <div className="space-y-2"><Skeleton className="h-14 rounded-xl" /><Skeleton className="h-14 rounded-xl" /></div>
  if (!followUps || followUps.length === 0) {
    return <EmptyState title="No follow-ups scheduled" description="Scheduled follow-ups will appear here." />
  }
  return (
    <motion.div variants={staggerContainer(0.03)} initial="initial" animate="animate" className="space-y-2">
      {followUps.map((f) => (
        <motion.div key={f._id} variants={staggerItem} className="flex items-center justify-between p-3 bg-surface-muted rounded-xl will-change-transform">
          <div>
            <p className="text-sm font-medium text-foreground">{f.reason || 'Follow-up'}</p>
            <p className="text-xs text-foreground-muted mt-0.5"><Calendar className="h-3 w-3 inline mr-1" /><DateDisplay date={f.date} format="dd MMM yyyy HH:mm" /></p>
          </div>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }} className="will-change-transform">
            <StatusBadge status={f.status} />
          </motion.div>
        </motion.div>
      ))}
    </motion.div>
  )
}
