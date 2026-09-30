import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from "motion"
import { useSearch } from '@/features/search'
import { PageHeader, EmptyState, ErrorState, DateDisplay, StatusBadge } from '@/components/common'
import { Skeleton } from '@/components/ui'
import { Search, Users, FileText, Pill, ChevronRight, AlertCircle } from 'lucide-react'
import { cn } from '@/utils/cn'
import { fadeUp, staggerContainer, staggerItem, fadeScale } from '@/motion/variants'

const typeFilters = [
  { value: 'all', label: 'All Results' },
  { value: 'patients', label: 'Patients' },
  { value: 'prescriptions', label: 'Prescriptions' },
]

export default function DoctorSearch() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [type, setType] = useState('all')
  const { data, isLoading, isError, refetch } = useSearch(query)

  const hasSearch = query.length > 1
  const isSearching = hasSearch && isLoading

  const patients = data?.patients || []
  const prescriptions = data?.prescriptions || []

  const showPatients = type === 'all' || type === 'patients'
  const showPrescriptions = type === 'all' || type === 'prescriptions'

  const hasResults = patients.length > 0 || prescriptions.length > 0

  return (
    <motion.div initial={fadeUp.initial} animate={fadeUp.animate} transition={fadeUp.animate.transition} className="max-w-5xl mx-auto space-y-6 will-change-transform">
      <PageHeader
        title="Search Records"
        description="Search patients and prescriptions across the clinic by name, phone, medicine, or summary text."
      />

      <motion.div initial={fadeUp.initial} animate={fadeUp.animate} transition={{ duration: 0.3, ease: [0.16,1,0.3,1], delay: 0.06 }} className="card-surface p-4 will-change-transform">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground-muted" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by patient name, phone, medicine, or summary..."
            className="w-full pl-11 pr-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none text-sm transition-[border-color,box-shadow] duration-150"
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {typeFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => setType(f.value)}
              className={cn(
                'px-3.5 py-1.5 text-xs font-medium rounded-lg border transition-colors',
                type === f.value
                  ? 'bg-primary-800 text-white border-primary-800'
                  : 'bg-surface text-foreground-secondary border-border hover:bg-surface-muted'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </motion.div>

      {isSearching && (
        <div className="card-surface p-5 space-y-5">
          <Skeleton className="h-4 w-40" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
          </div>
        </div>
      )}

      {hasSearch && isError && !isLoading && (
        <ErrorState title="Search failed" message="We couldn't complete your search. Please try again." onRetry={refetch} />
      )}

      {!hasSearch && (
        <motion.div initial={fadeScale.initial} animate={fadeScale.animate} transition={fadeScale.animate.transition} className="card-surface will-change-transform">
          <EmptyState
            icon={Search}
            title="Search clinic records"
            description="Enter at least two characters to search for patients, prescriptions, or medicines."
            className="py-14"
          />
        </motion.div>
      )}

      {hasSearch && !isLoading && !isError && !hasResults && (
        <motion.div initial={fadeScale.initial} animate={fadeScale.animate} transition={fadeScale.animate.transition} className="card-surface will-change-transform">
          <EmptyState
            icon={AlertCircle}
            title="No results found"
            description={`No records match "${query}". Try a different name, phone number, or medicine.`}
            className="py-14"
          />
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {hasSearch && !isLoading && !isError && hasResults && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.12, ease: [0.16,1,0.3,1] }} className="space-y-6 will-change-transform">
            {showPatients && patients.length > 0 && (
              <div className="card-surface overflow-hidden">
                <div className="px-5 py-4 border-b border-border-subtle flex items-center gap-2.5">
                  <Users className="h-4 w-4 text-foreground-muted" />
                  <h3 className="text-[15px] font-semibold text-foreground">Patients</h3>
                  <span className="text-xs text-foreground-muted ml-auto">{patients.length} found</span>
                </div>
                <motion.div variants={staggerContainer(0.03)} initial="initial" animate="animate" className="divide-y divide-border-subtle">
                  {patients.map((p) => (
                    <motion.button
                      key={p._id}
                      variants={staggerItem}
                      onClick={() => navigate(`/doctor/patients/${p._id}`)}
                      className="w-full flex items-center gap-4 px-5 py-4 hover:bg-surface-muted transition-colors text-left will-change-transform"
                    >
                      <div className="w-10 h-10 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-sm font-semibold shrink-0">
                        {p.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{p.name}</p>
                        <p className="text-xs text-foreground-muted">{p.phone || 'No phone'}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-foreground-muted shrink-0" />
                    </motion.button>
                  ))}
                </motion.div>
              </div>
            )}

            {showPrescriptions && prescriptions.length > 0 && (
              <div className="card-surface overflow-hidden">
                <div className="px-5 py-4 border-b border-border-subtle flex items-center gap-2.5">
                  <FileText className="h-4 w-4 text-foreground-muted" />
                  <h3 className="text-[15px] font-semibold text-foreground">Prescriptions</h3>
                  <span className="text-xs text-foreground-muted ml-auto">{prescriptions.length} found</span>
                </div>
                <motion.div variants={staggerContainer(0.03)} initial="initial" animate="animate" className="divide-y divide-border-subtle">
                  {prescriptions.map((p) => (
                    <motion.div key={p._id} variants={staggerItem} className="will-change-transform">
                      <Link
                        to={`/doctor/prescriptions/${p._id}`}
                        className="flex items-center gap-4 px-5 py-4 hover:bg-surface-muted transition-colors"
                      >
                        <div className="w-10 h-10 bg-surface-muted text-foreground-secondary rounded-full flex items-center justify-center shrink-0">
                          <Pill className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {p.patientId?.name || 'Unknown patient'}
                          </p>
                          <p className="text-xs text-foreground-muted truncate">
                            {p.ai?.summary?.substring(0, 90) || 'No summary'} ·{' '}
                            <DateDisplay date={p.prescriptionDate} format="dd MMM yyyy" />
                          </p>
                        </div>
                        <StatusBadge status={p.processingStatus} className="shrink-0" />
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
