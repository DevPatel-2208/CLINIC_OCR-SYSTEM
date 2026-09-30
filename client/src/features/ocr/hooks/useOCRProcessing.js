import { useState } from 'react'

export function useOCRProcessingSteps() {
  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    { key: 'uploading', label: 'Uploading Image', description: 'Sending prescription to server' },
    { key: 'quality', label: 'Quality Check', description: 'Analyzing image quality' },
    { key: 'opencv', label: 'OpenCV Processing', description: 'Enhancing and preprocessing image' },
    { key: 'tesseract', label: 'Tesseract OCR', description: 'Extracting text from image' },
    { key: 'ai', label: 'AI Analysis', description: 'Gemini AI extracting structured data' },
    { key: 'complete', label: 'Complete', description: 'Ready for review' },
  ]

  const advanceStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))
  }

  const resetSteps = () => setCurrentStep(0)

  return {
    steps,
    currentStep,
    advanceStep,
    resetSteps,
    isComplete: currentStep >= steps.length - 1,
  }
}
