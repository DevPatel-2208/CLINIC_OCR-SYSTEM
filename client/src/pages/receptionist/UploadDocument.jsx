import { useState, useRef } from 'react'
import { motion, AnimatePresence } from "motion"
import { useMutation, useQuery } from '@tanstack/react-query'
import { fadeUp, fadeScale, staggerContainer, staggerItem, listItem } from '@/motion/variants'
import { toast } from 'sonner'
import { prescriptionApi, patientApi } from '../../services'
import { PageHeader, Avatar } from '@/components/common'
import { Skeleton } from '@/components/ui'
import { Upload, ImageIcon, X, Check, Search } from 'lucide-react'
import Button from '@/components/ui/Button'

export default function ReceptionistUploadDocument() {
  const [patientId, setPatientId] = useState('')
  const [patientName, setPatientName] = useState('')
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [search, setSearch] = useState('')
  const [showResults, setShowResults] = useState(false)
  const fileRef = useRef()

  const mutation = useMutation({
    mutationFn: (formData) => prescriptionApi.upload(formData),
    onSuccess: () => { toast.success('Document uploaded and sent for review'); setFile(null); setPreview(null); setPatientId(''); setPatientName(''); },
    onError: (err) => toast.error(err.response?.data?.message || 'Upload failed'),
  })

  const { data: results, isLoading: searching } = useQuery({
    queryKey: ['staff-upload-search', search],
    queryFn: () => patientApi.search(search).then((r) => r.data.data),
    enabled: search.length > 1,
  })

  const handleFile = (e) => {
    const f = e.target.files[0]
    if (f) { setFile(f); setPreview(URL.createObjectURL(f)) }
  }

  const handleClear = () => {
    setFile(null)
    setPreview(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const selectPatient = (p) => {
    setPatientId(p._id)
    setPatientName(p.name)
    setSearch('')
    setShowResults(false)
  }

  const handleUpload = () => {
    if (!patientId || !file) return
    const fd = new FormData()
    fd.append('image', file)
    fd.append('patientId', patientId)
    mutation.mutate(fd)
  }

  return (
    <motion.div initial={fadeUp.initial} animate={fadeUp.animate} transition={fadeUp.animate.transition} className=" max-w-2xl mx-auto will-change-transform">
      <PageHeader
        title="Upload Document"
        description="Submit a patient's document for processing and clinical review."
      />

      <div className="card-surface p-6 space-y-5">
        {/* Patient selection */}
        <div>
          <label className="block text-sm font-medium text-foreground-secondary mb-1">Patient *</label>
          {patientName ? (
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary-50 border border-secondary-200">
              <div className="flex items-center gap-3">
                <Avatar name={patientName} size="sm" />
                <div>
          <p className="text-sm font-medium text-foreground">{patientName}</p>
                   <p className="text-xs text-foreground-muted">{patientId}</p>
                </div>
              </div>
              <button onClick={() => { setPatientId(''); setPatientName('') }} className="p-1 text-foreground-subtle hover:text-foreground-secondary" aria-label="Change patient">
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setShowResults(true) }}
                onFocus={() => setShowResults(true)}
                placeholder="Search patient by name or phone..."
                className="field-input pl-10 pr-3 py-2 text-sm"
              />
              {showResults && search.length > 1 && (
                <div className="absolute z-20 mt-2 w-full bg-surface border border-border rounded-lg shadow-card max-h-64 overflow-y-auto">
                  {searching ? (
                    <div className="p-3"><Skeleton className="h-10 w-full" count={2} /></div>
                  ) : results?.length > 0 ? (
                    results.map((p) => (
                      <button
                        key={p._id}
                        onClick={() => selectPatient(p)}
                        className="flex w-full items-center gap-3 p-3 hover:bg-surface-muted transition-colors text-left"
                      >
                        <Avatar name={p.name} size="sm" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                          <p className="text-xs text-foreground-muted">{p.phone || p.email}</p>
                        </div>
                        <Check className="h-4 w-4 text-secondary-600 ml-auto" />
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

        {/* File dropzone */}
        <div>
          <label className="block text-sm font-medium text-foreground-secondary mb-1">Document Image *</label>
            <div
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${file ? 'border-secondary-400 bg-secondary-50' : 'border-border hover:border-primary-400'}`}
          >
            <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png" onChange={handleFile} className="hidden" />
            {preview ? (
              <>
                <img src={preview} alt="Document preview" className="max-h-40 mx-auto rounded mb-3" />
                <p className="text-sm font-medium text-foreground-secondary">{file.name}</p>
                <p className="text-xs text-foreground-subtle mt-0.5">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </>
            ) : (
              <>
                <ImageIcon className="h-12 w-12 text-foreground-subtle mx-auto mb-3" />
                <p className="text-foreground-secondary font-medium">Click to upload document image</p>
                <p className="text-xs text-foreground-subtle mt-1">JPG, JPEG, PNG (max 10MB)</p>
              </>
            )}
          </div>
        </div>

        {file && (
          <Button type="button" variant="ghost" size="sm" onClick={handleClear} className="w-full justify-center text-error hover:bg-error-surface">
            <X className="h-4 w-4 mr-1" /> Remove Image
          </Button>
        )}

        <Button
          type="button"
          onClick={handleUpload}
          disabled={!patientId || !file || mutation.isPending}
          loading={mutation.isPending}
          className="w-full"
        >
          <Upload className="h-4 w-4" /> Upload for Review
        </Button>
      </div>
    </motion.div>
  )
}
