import { useState, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion'
import {
  Upload, Search, Loader2, ImageIcon, FileText, User, Check, ArrowLeft, ArrowRight, Sparkles, ChevronRight,
} from 'lucide-react'
import { toast } from 'sonner'
import { patientApi, prescriptionApi, ocrApi, aiApi } from '../../services'
import { PageHeader } from '@/components/common'
import { fadeUp, fadeScale, staggerContainer, staggerItem, successCheck } from '@/motion/variants'
import { cn } from '@/utils/cn'
import { ALLOWED_IMAGE_TYPES, FILE_SIZE_LIMIT } from '@/constants'

const STEPS = [
  { key: 'patient', label: 'Patient', icon: User },
  { key: 'upload', label: 'Upload', icon: Upload },
  { key: 'ocr', label: 'OCR', icon: ImageIcon },
  { key: 'ai', label: 'AI', icon: Sparkles },
  { key: 'review', label: 'Review', icon: FileText },
  { key: 'approve', label: 'Approve', icon: Check },
]

export default function PrescriptionUpload() {
  const [step, setStep] = useState('select-patient')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [processingStage, setProcessingStage] = useState(null)
  const [prescriptionId, setPrescriptionId] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const fileRef = useRef()
  const navigate = useNavigate()

  const { data: patients } = useQuery({
    queryKey: ['patients-search', searchQuery],
    queryFn: () => patientApi.search(searchQuery).then((r) => r.data.data),
    enabled: searchQuery.length > 1,
  })

  const stepIndex =
    !selectedPatient ? 0
    : !selectedFile ? 1
    : processing ? 2
    : prescriptionId ? 4
    : 2

  const validateFile = (file) => {
    if (!file) return 'No file selected'
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) return 'Only JPG, JPEG, PNG files are supported'
    if (file.size > FILE_SIZE_LIMIT) return 'File size must be under 10MB'
    return null
  }

  const handleFileSelect = (file) => {
    if (!file) return
    const error = validateFile(file)
    if (error) {
      toast.error(error)
      return
    }
    setSelectedFile(file)
    setPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return URL.createObjectURL(file)
    })
    setStep('selected')
  }

  const handleProcess = async () => {
    if (!selectedPatient || !selectedFile) return
    setProcessing(true)
    setProcessingStage('uploading')
    try {
      const formData = new FormData()
      formData.append('image', selectedFile)
      formData.append('patientId', selectedPatient._id)

      const uploadRes = await prescriptionApi.upload(formData)
      const id = uploadRes.data.data._id
      setPrescriptionId(id)

      setProcessingStage('ocr')
      toast.info('Processing image and running OCR...')
      await ocrApi.processImage(id)

      setProcessingStage('ai')
      toast.info('Running AI extraction...')
      await aiApi.extract(id)

      setProcessingStage('complete')
      toast.success('Prescription processed and ready for review')
      navigate(`/doctor/prescriptions/${id}/review`)
    } catch (err) {
      setProcessingStage(null)
      toast.error(err.response?.data?.message || 'Processing failed')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div initial={fadeUp.initial} animate={fadeUp.animate} transition={fadeUp.animate.transition} className="will-change-transform">
        <PageHeader
          eyebrow="OCR Module"
          accent="cyan"
          title="Upload Prescription"
          description="Process a prescription through the AI document intelligence workflow."
        />
      </motion.div>

      <motion.nav variants={staggerContainer(0.04)} initial="initial" animate="animate" className="mb-8 overflow-x-auto will-change-transform" aria-label="Progress">
        <ol className="flex items-center min-w-max gap-1">
          {STEPS.map((s, i) => {
            const isDone = i <= stepIndex
            const isCurrent = i === stepIndex
            const Icon = s.icon
            return (
              <motion.li key={s.key} variants={staggerItem} className="flex items-center will-change-transform">
                {i > 0 && (
                  <div className={cn('w-6 sm:w-10 h-0.5 mx-1 sm:mx-2', i <= stepIndex ? 'bg-[var(--icon-cyan)]' : 'bg-border')} />
                )}
                <div className="flex flex-col items-center gap-1.5">
                  <motion.div
                    animate={{ scale: isCurrent ? 1.05 : 1 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center transition-colors will-change-transform',
                      isDone ? 'bg-[var(--icon-cyan)] text-white'
                      : isCurrent ? 'bg-primary text-white ring-4 ring-accent-50 dark:ring-accent-600/30'
                      : 'bg-surface-muted text-foreground-muted'
                    )}>
                    {isDone ? (
                      <motion.div variants={successCheck} initial="initial" animate="animate" className="will-change-transform">
                        <Check className="h-4 w-4" />
                      </motion.div>
                    ) : <Icon className="h-4 w-4" />}
                  </motion.div>
                  <span className={cn('text-[11px] font-medium whitespace-nowrap', isCurrent ? 'text-primary-800' : 'text-foreground-muted')}>
                    {s.label}
                  </span>
                </div>
              </motion.li>
            )
          })}
        </ol>
      </motion.nav>

      <motion.div initial={fadeScale.initial} animate={fadeScale.animate} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1], delay: 0.1 }} className="card-surface p-6 sm:p-8 will-change-transform">
        <AnimatePresence mode="wait">
        {step === 'select-patient' || (!selectedFile && !selectedPatient) ? (
          <motion.div key="select-patient" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }} className="will-change-transform">
            <label htmlFor="patient-search" className="block text-sm font-semibold text-foreground mb-2">Select Patient</label>
            <p className="text-sm text-foreground-muted mb-4">Search for the patient this prescription belongs to.</p>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
              <input
                id="patient-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or phone..."
                className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              />
            </div>

            {searchQuery.length <= 1 && (
              <div className="mt-6 py-8 text-center border border-dashed border-border rounded-xl">
                <User className="h-10 w-10 text-foreground-muted mx-auto mb-3" />
                <p className="text-sm font-medium text-foreground-secondary">Search for a patient to continue</p>
                <p className="text-xs text-foreground-muted mt-1">Enter at least 2 characters of name or phone</p>
              </div>
            )}

            {searchQuery.length > 1 && (
              <motion.div variants={staggerContainer(0.03)} initial="initial" animate="animate" className="mt-3 border border-border divide-y divide-border-subtle rounded-xl overflow-hidden">
                {patients?.length > 0 ? (
                  patients.map((p) => (
                    <motion.button
                      key={p._id}
                      variants={staggerItem}
                      onClick={() => { setSelectedPatient(p); setStep('upload') }}
                      className="w-full px-4 py-3 text-left hover:bg-surface-muted flex items-center justify-between transition-colors will-change-transform"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-primary-50 text-primary-700 rounded-full flex items-center justify-center text-xs font-bold">
                          {p.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-foreground text-sm">{p.name}</p>
                          <p className="text-xs text-foreground-muted">{p.phone}</p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-foreground-muted" />
                    </motion.button>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center">
                    <p className="text-sm text-foreground-muted">No patients found for "{searchQuery}"</p>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div key="has-patient" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }} className="will-change-transform">
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }} className="mb-5 p-4 surface-cyan rounded-xl flex items-center justify-between will-change-transform">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-secondary-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  {selectedPatient?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{selectedPatient?.name}</p>
                  <p className="text-xs text-foreground-muted">{selectedPatient?.phone}</p>
                </div>
              </div>
              <button
                onClick={() => { setSelectedPatient(null); setSelectedFile(null); setPreview(null); setStep('select-patient') }}
                className="text-xs font-medium text-accent hover:text-accent-600"
              >
                Change
              </button>
            </motion.div>

            {!selectedFile ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }} className="will-change-transform">
                <label className="block text-sm font-semibold text-foreground mb-2">Upload Prescription Image</label>
                <p className="text-sm text-foreground-muted mb-4">Choose a clear image of the prescription.</p>
                <motion.div
                  onClick={() => fileRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={(e) => { e.preventDefault(); setDragActive(false); handleFileSelect(e.dataTransfer.files[0]) }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  animate={{ scale: dragActive ? 1.02 : 1 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className={cn(
                    'relative border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center cursor-pointer transition-all duration-200 will-change-transform overflow-hidden',
                    dragActive
                      ? 'border-accent bg-[var(--surface-cyan)] shadow-card-hover'
                      : 'border-border hover:border-accent/40 hover:bg-[var(--surface-cyan)]/50'
                  )}
                >
                  {dragActive && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 bg-[var(--surface-cyan)]/30 pointer-events-none"
                    />
                  )}
                  <div className={cn(
                    'w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all duration-200',
                    dragActive ? 'bg-[var(--icon-cyan)] text-white scale-110 shadow-card' : 'icon-box-cyan'
                  )}>
                    <ImageIcon className="h-7 w-7" />
                  </div>
                  <p className="text-foreground font-medium text-sm">{dragActive ? 'Drop your prescription here' : 'Upload prescription'}</p>
                  <p className="text-foreground-muted text-xs mt-1.5">Drag & drop your prescription image here, or click to browse</p>
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <span className="inline-flex items-center gap-1 text-[11px] text-foreground-muted bg-surface-muted px-2 py-0.5 rounded-md border border-border">JPG</span>
                    <span className="inline-flex items-center gap-1 text-[11px] text-foreground-muted bg-surface-muted px-2 py-0.5 rounded-md border border-border">PNG</span>
                    <span className="text-[11px] text-foreground-subtle">up to 10MB</span>
                  </div>
                </motion.div>
                <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png" onChange={(e) => handleFileSelect(e.target.files[0])} className="hidden" />
              </motion.div>
            ) : processing ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }} className="py-6 will-change-transform">
                <div className="flex items-center gap-3 mb-6">
                  <Loader2 className="h-5 w-5 animate-spin text-secondary-600" />
                  <div>
                    <p className="font-semibold text-foreground">Processing prescription</p>
                    <p className="text-xs text-foreground-muted">This may take a few seconds</p>
                  </div>
                </div>
                <div className="relative overflow-hidden rounded-xl">
                  <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-secondary-100/50 to-transparent will-change-transform" animate={{ x: ['-100%', '100%'] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }} style={{ willChange: 'transform' }} />
                  <motion.div variants={staggerContainer(0.05)} initial="initial" animate="animate" className="space-y-3 relative">
                    {[
                      { key: 'uploading', label: 'Uploading image' },
                      { key: 'ocr', label: 'OCR extraction & quality analysis' },
                      { key: 'ai', label: 'AI interpretation' },
                      { key: 'complete', label: 'Complete' },
                    ].map((stage, i) => {
                      const stages = ['uploading', 'ocr', 'ai', 'complete']
                      const currentIdx = stages.indexOf(processingStage)
                      const isDone = i <= currentIdx
                      const isCurrent = stages[i] === processingStage
                      return (
                        <motion.div key={stage.key} variants={staggerItem} className="flex items-center gap-3 will-change-transform">
                          {isDone ? (
                            <motion.div variants={successCheck} initial="initial" animate="animate" className="shrink-0 will-change-transform">
                              <Check className="h-4 w-4 text-success" />
                            </motion.div>
                          ) : (
                            <div className="h-4 w-4 rounded-full border-2 border-border shrink-0" />
                          )}
                          <span className={`text-sm ${isCurrent ? 'text-foreground font-medium' : isDone ? 'text-foreground-secondary' : 'text-foreground-muted'}`}>
                            {stage.label}
                          </span>
                          {isCurrent && <Loader2 className="h-3.5 w-3.5 animate-spin text-secondary-600" />}
                        </motion.div>
                      )
                    })}
                  </motion.div>
                </div>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }} className="will-change-transform">
                <label className="block text-sm font-semibold text-foreground mb-2">Review Prescription</label>
                <p className="text-sm text-foreground-muted mb-4">Confirm the image looks correct before processing.</p>
                <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} className="rounded-xl border border-border overflow-hidden mb-4 max-h-96 flex items-center justify-center bg-surface-muted will-change-transform">
                  {preview && (
                    <img src={preview} alt="Prescription preview" className="w-full h-full object-contain max-h-96" />
                  )}
                </motion.div>
                <div className="flex items-center justify-between bg-surface-muted rounded-xl p-3 mb-6">
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText className="h-4 w-4 text-foreground-muted shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{selectedFile.name}</p>
                      <p className="text-xs text-foreground-muted">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setSelectedFile(null); setPreview(null) }}
                    className="text-xs font-medium text-error hover:text-error-dark shrink-0"
                  >
                    Remove
                  </button>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => { setSelectedFile(null); setPreview(null) }}
                    className="px-4 py-2.5 border border-border rounded-lg text-foreground-secondary hover:bg-surface-muted text-sm font-medium inline-flex items-center gap-2 justify-center"
                  >
                    <ArrowLeft className="h-4 w-4" /> Change Image
                  </button>
                  <motion.button
                    onClick={handleProcess}
                    disabled={processing}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                    className="flex-1 px-4 py-2.5 bg-primary-800 text-white rounded-lg hover:bg-primary-900 dark:bg-primary dark:hover:bg-primary-hover disabled:opacity-60 text-sm font-medium inline-flex items-center justify-center gap-2 shadow-sm will-change-transform"
                  >
                    Process Prescription <ArrowRight className="h-4 w-4" />
                  </motion.button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
