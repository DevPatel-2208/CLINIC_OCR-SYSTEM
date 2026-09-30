import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { usePatients, usePatientSearch, calculateAge } from '@/features/patients'
import { PageHeader, EmptyState, ErrorState, SearchBar } from '@/components/common'
import { Skeleton, Button } from '@/components/ui'
import { Plus, ChevronRight, Users } from 'lucide-react'

export default function DoctorPatients() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const { data, isLoading, isError, refetch } = usePatients({})
  const { data: searchResults, isLoading: searchLoading } = usePatientSearch(search)

  const searching = search.length > 1
  const patients = searching ? (searchResults || []) : (data || [])
  const listLoading = searching ? searchLoading : isLoading

  if (isLoading && !searching) {
    return (
      <div>
        <Skeleton className="h-9 w-40 mb-2" />
        <Skeleton className="h-4 w-64 mb-6" />
        <Skeleton className="h-12 rounded-xl mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      </div>
    )
  }

  if (isError && !searching) {
    return <ErrorState title="Unable to load patients" message="We couldn't retrieve your patients. Please try again." onRetry={refetch} />
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      <PageHeader
        title="Patients"
        description="View and manage the patients under your care."
        action={
          <Button
            onClick={() => navigate('/doctor/prescriptions/upload')}
          >
            <Plus className="h-4 w-4" /> New Prescription
          </Button>
        }
      />

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search patients by name or phone..."
        className="max-w-md"
      />

      {listLoading ? (
        <div className="card-surface p-5 space-y-3">
          <Skeleton className="h-4 w-32" />
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </div>
      ) : patients.length === 0 ? (
        <div className="card-surface">
          <EmptyState
            icon={Users}
            title={searching ? 'No matching patients' : 'No patients found'}
            description={searching ? `No patients match "${search}".` : 'Patients assigned to you will appear here.'}
            className="py-14"
          />
        </div>
      ) : (
        <div className="card-surface overflow-hidden">
          <div className="divide-y divide-border-subtle">
            {patients.map((patient) => {
              const age = calculateAge(patient.dateOfBirth)
              return (
                <Link
                  key={patient._id}
                  to={`/doctor/patients/${patient._id}`}
                  className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-surface-muted transition-colors"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-11 h-11 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-sm font-semibold shrink-0">
                      {patient.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground truncate">{patient.name}</p>
                      <p className="text-sm text-foreground-muted">{patient.phone || 'No phone'}</p>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-2 shrink-0">
                    {patient.gender && (
                      <span className="text-xs text-foreground-muted bg-surface-muted border border-border rounded-lg px-2 py-1">{patient.gender}</span>
                    )}
                    {patient.bloodGroup && (
                      <span className="text-xs font-medium text-error bg-error-surface border border-error/20 rounded-lg px-2 py-1">Blood {patient.bloodGroup}</span>
                    )}
                    {age != null && (
                      <span className="text-xs text-foreground-muted bg-surface-muted border border-border rounded-lg px-2 py-1">{age} yrs</span>
                    )}
                  </div>
                  <ChevronRight className="h-4 w-4 text-foreground-muted shrink-0" />
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
