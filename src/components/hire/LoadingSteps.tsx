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
    <div className="space-y-8 sm:space-y-10 max-w-4xl mx-auto px-4 sm:px-6">
      <div className="text-center space-y-3 sm:space-y-4">
        <h1 className="text-2xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary to-primary/60 tracking-tight">
          Your AI Interview is Being Prepared
        </h1>
        <p className="text-base sm:text-xl text-foreground/80 leading-relaxed max-w-2xl mx-auto">
          We're crafting a personalized interview experience just for you
        </p>
      </div>

      <div className="relative pt-2 mt-6 sm:mt-8">
        <div className="flex items-center justify-between mb-2 text-sm font-medium">
          <div className="text-foreground/70">Progress</div>
          <div className="text-primary">{Math.round(progress)}% Complete</div>
        </div>
        <div className="overflow-hidden h-2.5 sm:h-2 flex rounded-full bg-primary/10">
          <div
            style={{ width: `${progress}%` }}
            className="flex rounded-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500 ease-out"
          />
        </div>
      </div>

      <div className="space-y-4 sm:space-y-6">
        {steps.map((step, index) => {
          const isActive = index === currentStep
          const isCompleted = index < currentStep
          
          return (
            <div
              key={step.message}
              className={cn(
                "flex items-start gap-4 sm:gap-5 p-4 sm:p-6 rounded-xl transition-all duration-300",
                isActive && "bg-primary/5 shadow-sm ring-1 ring-primary/10",
                isCompleted && "opacity-60"
              )}
            >
              <div
                className={cn(
                  "h-10 w-10 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center transition-all duration-300 shadow-sm",
                  isActive 
                    ? "bg-gradient-to-br from-primary to-primary/90 text-white scale-110 shadow-lg shadow-primary/20" 
                    : "bg-primary/10 text-primary"
                )}
              >
                <div className={cn(
                  "h-5 w-5 sm:h-6 sm:w-6",
                  isActive && "animate-pulse"
                )}>
                  {step.icon}
                </div>
              </div>
              
              <div className="space-y-1.5 sm:space-y-2 flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <h3 className="text-base sm:text-xl font-semibold leading-tight">
                    {step.message}
                  </h3>
                  {isActive && (
                    <div className="hidden sm:block animate-pulse">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    </div>
                  )}
                </div>
                <p className="text-sm sm:text-lg text-foreground/70 leading-relaxed">
                  {step.detail}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="pt-4 sm:pt-6">
        <p className="text-center text-sm sm:text-lg text-foreground/80 leading-relaxed font-medium">
          Your personalized interview experience will begin in just a moment
        </p>
      </div>
    </div>
  )
}
