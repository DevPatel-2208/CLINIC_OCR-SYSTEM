import { useState, useRef } from 'react'
import { Upload, ImageIcon, Loader2, X } from 'lucide-react'
import { cn } from '@/utils/cn'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Label from '@/components/ui/Label'

export default function PrescriptionUploadForm({ 
  onUpload, 
  isLoading = false, 
  patientId,
  patientName,
  onCancel,
  className,
}) {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const fileRef = useRef()

  const handleFileSelect = (e) => {
    const f = e.target.files[0]
    if (!f) return
    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(f.type)) {
      alert('Only JPG, JPEG, PNG files are supported')
      return
    }
    if (f.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB')
      return
    }
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const handleRemoveFile = () => {
    setFile(null)
    setPreview(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!patientId || !file) return
    const formData = new FormData()
    formData.append('image', file)
    formData.append('patientId', patientId)
    onUpload(formData)
  }

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-4', className)}>
      {patientName && (
        <div className="p-3 bg-success-surface rounded-lg">
          <p className="text-sm font-medium text-success">Patient: {patientName}</p>
        </div>
      )}
      
      <div>
        <Label htmlFor="patientId">Select Patient *</Label>
        <Input
          id="patientId"
          type="text"
          placeholder="Enter Patient ID or search..."
          value={patientId || ''}
          onChange={(e) => {/* handled by parent */}}
          readOnly
          className="bg-surface-muted cursor-pointer"
        />
      </div>

      <div
        onClick={() => fileRef.current?.click()}
        className={cn(
          'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors',
          file ? 'border-primary bg-primary-50 dark:bg-primary-50/15' : 'border-border hover:border-primary'
        )}
      >
        <input 
          ref={fileRef} 
          type="file" 
          accept=".jpg,.jpeg,.png" 
          onChange={handleFileSelect} 
          className="hidden" 
        />
        {preview ? (
          <>
            <img src={preview} alt="Prescription preview" className="max-h-40 mx-auto rounded mb-4" />
            <p className="text-sm font-medium text-foreground">{file.name}</p>
            <p className="text-xs text-foreground-muted mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
          </>
        ) : (
          <>
            <ImageIcon className="h-12 w-12 text-foreground-muted mx-auto mb-4" />
            <p className="text-foreground-secondary font-medium">Click to upload prescription image</p>
            <p className="text-sm text-foreground-muted mt-1">JPG, JPEG, PNG (max 10MB)</p>
          </>
        )}
      </div>

      {file && (
        <Button type="button" variant="ghost" size="sm" onClick={handleRemoveFile} className="w-full justify-center text-error hover:bg-error-surface">
          <X className="h-4 w-4 mr-1" /> Remove Image
        </Button>
      )}

      <div className="flex gap-3 pt-4 border-t">
        <Button 
          type="submit" 
          disabled={isLoading || !patientId || !file} 
          className="flex-1 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Upload for Processing
            </>
          )}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}