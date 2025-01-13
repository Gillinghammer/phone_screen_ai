import { useState, useEffect } from 'react'
import { MagnifyingGlassIcon, LightningBoltIcon, QuestionMarkCircledIcon, CheckCircledIcon } from '@radix-ui/react-icons'
import { cn } from '@/lib/utils'

interface LoadingStep {
  icon: JSX.Element
  message: string
  detail: string
}

export default function LoadingSteps() {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const steps: LoadingStep[] = [
    {
      icon: <MagnifyingGlassIcon className="h-5 w-5" />,
      message: 'Analyzing Job Requirements',
      detail: 'Extracting key skills and qualifications to tailor your perfect interview'
    },
    {
      icon: <LightningBoltIcon className="h-5 w-5" />,
      message: 'Crafting Interview Strategy',
      detail: 'Designing a personalized approach to showcase your strengths'
    },
    {
      icon: <QuestionMarkCircledIcon className="h-5 w-5" />,
      message: 'Creating Interview Questions',
      detail: 'Preparing targeted questions that match your experience level'
    },
    {
      icon: <CheckCircledIcon className="h-5 w-5" />,
      message: 'Setting Up Your Interview',
      detail: 'Preparing your AI interviewer for an engaging conversation'
    }
  ]

  useEffect(() => {
    const itemDuration = 4000 // Duration for each step
    const totalDuration = itemDuration * 3 // itemDuration * 3
    const progressUpdateInterval = 50 // Update every 50ms
    const progressIncrement = (100 * progressUpdateInterval) / totalDuration // Calculate how much to increment each update

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return Math.min(100, prev + progressIncrement)
      })
    }, progressUpdateInterval)

    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= steps.length - 1) {
          clearInterval(stepInterval)
          return prev
        }
        return prev + 1
      })
    }, itemDuration)

    return () => {
      clearInterval(progressInterval)
      clearInterval(stepInterval)
    }
  }, [steps.length])

  return (
    <div className="space-y-12 py-12">
      <div className="text-center space-y-4 mb-12">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
          Your AI Interview is Being Prepared
        </h2>
        <p className="text-lg text-foreground/80">
          We&apos;re crafting a personalized interview experience just for you
        </p>
      </div>

      <div className="flex justify-center mb-12">
        <div className="w-full max-w-4xl px-4">
          <div className="h-3 bg-primary/5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-300 ease-out relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" 
                style={{ 
                  backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                  backgroundSize: '200% 100%',
                }} 
              />
            </div>
          </div>
          <div className="mt-3 text-center">
            <span className="text-sm font-medium bg-primary/10 text-primary px-3 py-1 rounded-full">
              {Math.round(progress)}% Complete
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4">
        {steps.map((step, index) => {
          const isComplete = index < currentStep
          const isCurrent = index === currentStep

          return (
            <div
              key={step.message}
              className={cn(
                'flex items-start gap-4 transition-all duration-500',
                {
                  'opacity-100 translate-x-0': index <= currentStep,
                  'opacity-40 translate-x-4': index > currentStep
                }
              )}
            >
              <div
                className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300',
                  {
                    'bg-gradient-to-br from-primary to-primary/80 text-white shadow-lg shadow-primary/20': isComplete || isCurrent,
                    'bg-primary/10 text-primary': !isComplete && !isCurrent
                  }
                )}
              >
                <div className={cn(
                  'transition-transform duration-300',
                  (isComplete || isCurrent) && 'animate-[pulse_2s_infinite]'
                )}>
                  {step.icon}
                </div>
              </div>

              <div className="flex-1 space-y-2 pb-8">
                <p className={cn(
                  "font-semibold transition-colors duration-300",
                  (isComplete || isCurrent) ? "text-primary text-lg" : "text-foreground/60"
                )}>
                  {step.message}
                </p>
                <p className="text-base text-foreground/60 leading-relaxed">{step.detail}</p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="text-center">
        <p className="text-sm text-foreground/60">
          Your personalized interview experience will begin in just a moment
        </p>
      </div>
    </div>
  )
}
