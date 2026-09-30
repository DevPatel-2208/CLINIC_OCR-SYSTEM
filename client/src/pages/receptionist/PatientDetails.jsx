import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from "motion"
import { useParams, Link, useNavigate } from 'react-router-dom'
import { fadeUp, fadeScale, staggerContainer, staggerItem, listItem } from '@/motion/variants'
import { patientApi } from '../../services'
import { PageHeader, EmptyState, ErrorState, Avatar, SectionCard, DateDisplay } from '@/components/common'
import { Skeleton } from '@/components/ui'
import { ArrowLeft, Phone, Mail, MapPin, User, Calendar, Upload, Sparkles } from 'lucide-react'
import { calculateAge } from '@/features/patients'

export default function ReceptionistPatientDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['staff-patient', id],
    queryFn: () => patientApi.getById(id).then((r) => r.data.data),
  })

  if (isLoading) {
    return (
    <div><Skeleton className="will-change-transform h-9 w-40 mb-6" />
        <Skeleton className="h-40 rounded-xl mb-6" />
        <Skeleton className="h-56 rounded-xl" />
      </div>
    )
  }

  if (isError) {
    return <ErrorState title="Unable to load patient" message="We couldn't retrieve this patient record. Please try again." onRetry={refetch} />
  }
  if (!data) return <EmptyState title="Patient not found" />

  const age = calculateAge(data.dateOfBirth)

  const details = [
    { label: 'Phone', value: data.phone || 'N/A', icon: Phone },
    { label: 'Email', value: data.email || 'N/A', icon: Mail },
    { label: 'Gender', value: data.gender ? (data.gender === 'MALE' ? 'Male' : data.gender === 'FEMALE' ? 'Female' : 'Other') : 'N/A', icon: User },
    { label: 'Date of Birth', value: age != null ? <span>{data.dateOfBirth ? <DateDisplay date={data.dateOfBirth} format="dd MMM yyyy" /> : 'N/A'} · {age} years</span> : 'N/A', icon: Calendar },
    { label: 'Address', value: data.address || 'N/A', icon: MapPin },
  ]

  return (
    <motion.div initial={fadeUp.initial} animate={fadeUp.animate} transition={fadeUp.animate.transition} className="max-w-4xl mx-auto will-change-transform">
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <Link to="/receptionist/patients" className="p-2 text-foreground-muted hover:bg-surface-muted rounded-lg">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <PageHeader title="Patient Details" description="View patient registration information" breadcrumbs={[{ label: 'Patients', href: '/receptionist/patients' }, { label: data.name }]} />
      </div>

      {/* Patient header card */}
      <div className="card-surface p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <Avatar name={data.name} size="xl" />
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-foreground">{data.name}</h2>
            {data.bloodGroup && (
              <p className="text-sm text-foreground-muted mt-1">Blood group: {data.bloodGroup}</p>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex flex-wrap gap-2 mt-5 pt-5 border-t border-border">
          <button
            onClick={() => navigate(`/receptionist/upload`)}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-primary-800 text-white text-sm font-medium rounded-lg hover:bg-primary-900 shadow-sm"
          >
            <Upload className="h-4 w-4" /> Upload Document
          </button>
        </div>
      </div>

      {/* Contact & personal details */}
      <SectionCard title="Registration Information" description="Patient contact and personal details" className="mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {details.map((d) => (
            <div key={d.label} className="flex items-start gap-3">
              <div className="w-9 h-9 bg-primary-50 text-primary-700 rounded-lg flex items-center justify-center shrink-0">
                <d.icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-foreground-subtle uppercase tracking-wide">{d.label}</p>
                <p className="text-sm text-foreground mt-0.5">{d.value}</p>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {data.medicalHistory && (
        <SectionCard title="Medical History" description="Recorded medical background" icon={Sparkles} className="mb-6">
          <p className="text-sm text-foreground-secondary whitespace-pre-line">{data.medicalHistory}</p>
        </SectionCard>
      )}

      {data.allergies?.length > 0 && (
        <SectionCard title="Allergies" description="Known patient allergies" icon={Sparkles}>
          <div className="flex flex-wrap gap-2">
            {data.allergies.map((a) => (
              <span key={a} className="inline-flex items-center text-xs bg-warning-light text-warning rounded-lg px-2.5 py-1.5">
                {a}
              </span>
            ))}
          </div>
        </SectionCard>
      )}
    </motion.div>
  )
}
