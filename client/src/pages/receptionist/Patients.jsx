import { useState } from 'react'
import { motion, AnimatePresence } from "motion"
import { useQuery } from '@tanstack/react-query'
import { fadeUp, fadeScale, staggerContainer, staggerItem, listItem } from '@/motion/variants'
import { patientApi } from '../../services'
import { PageHeader, EmptyState, ErrorState, Avatar, SearchBar } from '@/components/common'
import { Skeleton } from '@/components/ui'
import { Link } from 'react-router-dom'
import { UserPlus, Phone, ChevronRight } from 'lucide-react'

export default function ReceptionistPatients() {
  const [search, setSearch] = useState('')
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['staff-patients', search],
    queryFn: () => patientApi.search(search).then((r) => r.data.data),
    enabled: search.length > 1,
  })

  const showResults = search.length > 1

  return (
    <motion.div initial={fadeUp.initial} animate={fadeUp.animate} transition={fadeUp.animate.transition} className=" max-w-4xl mx-auto will-change-transform">
      <PageHeader
        title="Patient Records"
        description="Search for existing patient records or register a new patient."
        action={
          <Link
            to="/receptionist/patients/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-800 text-white text-sm font-medium rounded-lg hover:bg-primary-900 transition-colors shadow-sm"
          >
            <UserPlus className="h-4 w-4" /> Register Patient
          </Link>
        }
      />

      <SearchBar
        placeholder="Search by patient name, phone, or email..."
        value={search}
        onChange={setSearch}
        className="mb-6"
      />

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      )}

      {isError && <ErrorState title="Search failed" message="We couldn't search patient records. Please try again." onRetry={refetch} />}

      {!isLoading && showResults && data?.length === 0 && (
        <EmptyState
          icon={UserPlus}
          title="No patients found"
          description="Try a different search term or register a new patient."
          action={
            <Link
              to="/receptionist/patients/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-800 text-white text-sm font-medium rounded-lg hover:bg-primary-900"
            >
              <UserPlus className="h-4 w-4" /> Register Patient
            </Link>
          }
          className="py-10"
        />
      )}

      {!isLoading && !showResults && !isError && (
        <div className="card-surface p-8 text-center">
          <p className="text-sm text-foreground-muted">
            Type at least two characters to start searching the patient directory.
          </p>
        </div>
      )}

      {showResults && data?.length > 0 && (
        <div className="space-y-3">
          {data.map((p) => (
            <Link
              key={p._id}
              to={`/receptionist/patients/${p._id}`}
              className="flex items-center gap-4 p-4 card-surface hover:shadow-card-hover transition-all group"
            >
              <Avatar name={p.name} size="md" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate">{p.name}</p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5 mt-1 text-xs text-foreground-muted">
                  {p.phone && (
                    <span className="inline-flex items-center gap-1">
                      <Phone className="h-3 w-3" /> {p.phone}
                    </span>
                  )}
                  {p.gender && <span>{p.gender === 'MALE' ? 'Male' : p.gender === 'FEMALE' ? 'Female' : 'Other'}</span>}
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-foreground-subtle group-hover:text-foreground-muted transition-colors" />
            </Link>
          ))}
        </div>
      )}
    </motion.div>
  )
}
