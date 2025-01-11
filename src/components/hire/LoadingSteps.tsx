import { useState, useEffect } from 'react'
import { ReloadIcon, MagnifyingGlassIcon, LightningBoltIcon, QuestionMarkCircledIcon, CheckCircledIcon } from '@radix-ui/react-icons'
import { cn } from '@/lib/utils'

interface LoadingStep {
  icon: JSX.Element
  message: string
  detail: string
}

export default function LoadingSteps() {
  const [currentStep, setCurrentStep] = useState(0)
  const steps: LoadingStep[] = [
    {
      icon: <MagnifyingGlassIcon className="h-5 w-5" />,
      message: 'Analyzing job description',
      detail: 'Extracting key requirements and responsibilities'
    },
    {
      icon: <LightningBoltIcon className="h-5 w-5" />,
      message: 'Crafting interview strategy',
      detail: 'Designing a personalized evaluation approach'
    },
    {
      icon: <QuestionMarkCircledIcon className="h-5 w-5" />,
      message: 'Generating questions',
      detail: 'Creating targeted behavioral and technical questions'
    },
    {
      icon: <CheckCircledIcon className="h-5 w-5" />,
      message: 'Finalizing preparation',
      detail: 'Setting up your AI interviewer'
    }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev))
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-8 py-12">
      <div className="flex justify-center mb-12">
        <div className="relative">
          <ReloadIcon className="h-12 w-12 animate-spin text-primary" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-2 w-2 rounded-full bg-primary" />
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto space-y-6">
        {steps.map((step, index) => {
          const isActive = index === currentStep
          const isComplete = index < currentStep
          const isPending = index > currentStep

          return (
            <div
              key={step.message}
              className={cn(
                "relative flex items-start gap-4 transition-all duration-500",
                isPending ? "opacity-30" : "opacity-100"
              )}
            >
              <div className="flex-shrink-0 mt-1">
                <div className={cn(
                  "p-1 rounded-full transition-colors duration-200",
                  isActive && "bg-primary/10",
                  isComplete && "bg-primary/20"
                )}>
                  {step.icon}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "font-medium transition-colors duration-200",
                  isActive && "text-primary",
                  isComplete && "text-primary/80"
                )}>
                  {step.message}
                  {isActive && <span className="animate-pulse">...</span>}
                </p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {step.detail}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
