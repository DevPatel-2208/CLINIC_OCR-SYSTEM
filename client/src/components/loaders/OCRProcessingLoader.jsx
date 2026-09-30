import { useState, useEffect } from 'react'
import { cn } from '@/utils/cn'
import { CheckCircle2, Image, Cpu, Brain, Search, AlertCircle } from 'lucide-react'

const steps = [
  { id: 'upload', label: 'Uploading', icon: Image, description: 'Uploading prescription image to cloud storage' },
  { id: 'quality', label: 'Quality Check', icon: Search, description: 'Analyzing image quality, blur, lighting, resolution' },
  { id: 'preprocessing', label: 'OpenCV Processing', icon: Cpu, description: 'Deskew, denoise, contrast enhancement, thresholding' },
  { id: 'ocr', label: 'OCR Extraction', icon: Search, description: 'Running Tesseract OCR to extract raw text' },
  { id: 'ai', label: 'AI Analysis', icon: Brain, description: 'Gemini AI structuring medicines, dosage, frequency' },
  { id: 'review', label: 'Ready for Review', icon: AlertCircle, description: 'Prescription ready for doctor verification' },
]

const stepOrder = ['upload', 'quality', 'preprocessing', 'ocr', 'ai', 'review']

export default function OCRProcessingLoader({ 
  currentStep = 'upload', 
  className,
  compact = false,
}) {
  const [animatedStep, setAnimatedStep] = useState(currentStep)

  useEffect(() => {
    setAnimatedStep(currentStep)
  }, [currentStep])

  const getStepIndex = (stepId) => stepOrder.indexOf(stepId)
  const currentIndex = getStepIndex(currentStep)

  const renderStep = (step, index) => {
    const isCompleted = index < currentIndex
    const isCurrent = index === currentIndex
    const isPending = index > currentIndex

    return (
      <div key={step.id} className="flex items-start gap-3">
        <div className="flex flex-col items-center flex-shrink-0">
          <div className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center transition-all',
            isCompleted && 'bg-success text-white',
            isCurrent && 'bg-cyan-500 text-white animate-pulse',
            isPending && 'bg-surface-muted text-foreground-subtle border border-border'
          )}>
            {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <step.icon className="h-4 w-4" />}
          </div>
          {!compact && index < steps.length - 1 && (
            <div className={cn(
              'w-0.5 h-8 mt-1 transition-colors',
              isCompleted ? 'bg-success' : 'bg-border'
            )} />
          )}
        </div>
        {!compact && (
          <div className="flex-1 min-w-0 pt-1">
            <div className={cn(
              'text-sm font-medium transition-colors',
              isCompleted && 'text-success',
              isCurrent && 'text-cyan-700 dark:text-cyan-400',
              isPending && 'text-foreground-muted'
            )}>
              {step.label}
            </div>
            <p className={cn(
              'text-xs mt-0.5 transition-colors',
              isCompleted && 'text-success/70',
              isCurrent && 'text-cyan-600/70 dark:text-cyan-400/70',
              isPending && 'text-foreground-subtle'
            )}>
              {step.description}
            </p>
          </div>
        )}
      </div>
    )
  }

  if (compact) {
    return (
      <div className={cn('flex items-center gap-2 overflow-x-auto pb-2', className)}>
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center gap-1 flex-shrink-0">
            <div className={cn(
              'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-all',
              index < currentIndex && 'bg-success text-white',
              index === currentIndex && 'bg-cyan-500 text-white animate-pulse',
              index > currentIndex && 'bg-surface-muted text-foreground-subtle border border-border'
            )}>
              {index < currentIndex ? <CheckCircle2 className="h-3 w-3" /> : <step.icon className="h-3 w-3" />}
            </div>
            <span className={cn(
              'text-xs font-medium whitespace-nowrap hidden sm:block',
              index <= currentIndex ? 'text-foreground' : 'text-foreground-muted'
            )}>
              {step.label}
            </span>
            {index < steps.length - 1 && (
              <div className={cn(
                'w-8 h-0.5 hidden sm:block',
                index < currentIndex ? 'bg-success' : 'bg-border'
              )} />
            )}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {steps.map((step, index) => renderStep(step, index))}
    </div>
  )
}
