import { useState } from 'react'
import { motion, AnimatePresence } from "motion"
import { useQuery } from '@tanstack/react-query'
import { fadeUp, fadeScale, staggerContainer, staggerItem, listItem } from '@/motion/variants'
import { PageHeader, EmptyState, LoadingState, SearchBar } from '@/components/common'
import { DocumentTable } from '@/components/tables'
import { Button } from '@/components/ui'
import { FileText, Upload } from 'lucide-react'
import { patientApi } from '@/services'
import { useUploadDocument, useDeleteDocument } from '@/features/documents/document.service'
import { toast } from 'sonner'

export default function DoctorDocuments() {
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  const { data: patients } = useQuery({
    queryKey: ['patients-search', searchQuery],
    queryFn: () => patientApi.search(searchQuery).then((r) => r.data.data),
    enabled: searchQuery.length > 1,
  })

  return (
    <motion.div initial={fadeUp.initial} animate={fadeUp.animate} transition={fadeUp.animate.transition} className="max-w-6xl mx-auto space-y-6 will-change-transform">
      <PageHeader
        eyebrow="Documents"
        accent="slate"
        title="Documents"
        description="Upload, organise, and manage clinical documents for your patients."
      />

      {!selectedPatient ? (
        <div className="card-surface p-6">
          <h3 className="text-sm font-semibold text-foreground mb-3">Select Patient</h3>
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by name or phone..."
          />
          {patients?.length > 0 && (
            <motion.div variants={staggerContainer(0.04)} initial="initial" animate="animate" className="mt-3 border border-border divide-y divide-border-subtle rounded-xl overflow-hidden">
              {patients.map((p) => (
                <motion.button
                  variants={staggerItem}
                  key={p._id}
                  onClick={() => setSelectedPatient(p)}
                  className="w-full px-4 py-3 text-left hover:bg-surface-muted flex items-center gap-3 transition-colors will-change-transform"
                >
                  <div className="w-9 h-9 bg-primary-50 text-primary-700 rounded-full flex items-center justify-center text-xs font-bold">
                    {p.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">{p.name}</p>
                    <p className="text-xs text-foreground-muted">{p.phone}</p>
                  </div>
                </motion.button>
              ))}
            </motion.div>
          )}
          {searchQuery.length > 1 && patients?.length === 0 && (
            <p className="text-sm text-foreground-muted mt-3">No patients found.</p>
          )}
        </div>
      ) : (
        <PatientDocuments patient={selectedPatient} onChangePatient={() => setSelectedPatient(null)} />
      )}
    </motion.div>
  )
}

function PatientDocuments({ patient, onChangePatient }) {
  const { data: documents, isLoading } = useQuery({
    queryKey: ['documents', patient._id],
    queryFn: () => patientApi.getDocuments(patient._id).then((r) => r.data.data),
  })

  const uploadMutation = useUploadDocument()
  const deleteMutation = useDeleteDocument()

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)
    formData.append('patientId', patient._id)
    formData.append('title', file.name)
    formData.append('type', 'OTHER')

    try {
      await uploadMutation.mutateAsync(formData)
      toast.success('Document uploaded')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this document?')) return
    try {
      await deleteMutation.mutateAsync(id)
      toast.success('Document deleted')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button onClick={onChangePatient} className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            Change Patient
          </button>
          <span className="text-foreground-muted">|</span>
          <h3 className="text-sm font-semibold text-foreground">{patient.name} - Documents</h3>
        </div>
        <label className="inline-flex items-center gap-2 px-3 py-2 bg-primary-800 text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-primary-900">
          <Upload className="h-4 w-4" />
          Upload
          <input type="file" className="hidden" onChange={handleUpload} accept=".pdf,.jpg,.jpeg,.png" />
        </label>
      </div>

      {isLoading ? (
        <LoadingState message="Loading documents..." />
      ) : documents?.length > 0 ? (
        <DocumentTable data={documents} onDelete={handleDelete} onView={(row) => row.fileUrl && window.open(row.fileUrl, '_blank')} onDownload={(row) => row.fileUrl && window.open(row.fileUrl, '_blank')} />
      ) : (
        <motion.div initial={fadeScale.initial} animate={fadeScale.animate} transition={fadeScale.animate.transition} className="card-surface p-8 will-change-transform">
          <EmptyState
            icon={FileText}
            title="No documents yet"
            description="Upload clinical documents for this patient."
          />
        </motion.div>
      )}
    </div>
  )
}
