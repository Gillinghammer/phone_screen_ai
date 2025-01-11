import { useState, useEffect } from 'react'

export default function LoadingSteps() {
  const [currentStep, setCurrentStep] = useState(0)
  const steps = [
    'Analyzing job description...',
    'Identifying key requirements...',
    'Generating relevant questions...',
    'Preparing your interview...'
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev))
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-8 py-12">
      <div className="flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div
            key={step}
            className={`flex items-center space-x-3 transition-opacity duration-300 ${
              index <= currentStep ? 'opacity-100' : 'opacity-30'
            }`}
          >
            <div
              className={`h-2 w-2 rounded-full ${
                index <= currentStep ? 'bg-primary' : 'bg-gray-300'
              }`}
            />
            <span className="text-sm">{step}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
