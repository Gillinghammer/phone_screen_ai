import { useState } from 'react'
import type { NextPage } from 'next'
import JobListingInput from '@/components/hire/JobListingInput'
import JobDetails from '@/components/hire/JobDetails'

const HirePage: NextPage = () => {
  const [step, setStep] = useState(1)
  const [jobDescription, setJobDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleScrape = async (url: string) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/scrape-job', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      })

      if (!response.ok) throw new Error('Failed to scrape job listing')

      const data = await response.json()
      setJobDescription(data.jobDescription)
    } catch (error) {
      console.error('Failed to scrape job listing:', error)
      // TODO: Add error handling UI
    } finally {
      setIsLoading(false)
    }
  }

  const handleJobDescriptionSubmit = (description: string) => {
    setJobDescription(description)
    setStep(2)
    setIsLoading(true)
  }

  const handleStartOver = () => {
    setJobDescription('')
    setStep(1)
    setIsLoading(false)
  }

  return (
    <main className="container mx-auto p-4">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-6">AI Job Interview Assistant</h1>
          <div className="mb-6 flex justify-between items-center">
            <div className="flex space-x-3">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                step === 1 
                ? 'border-primary bg-primary text-primary-foreground' 
                : 'border-gray-300 text-gray-300'
              }`}>
                1
              </div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                step === 2 
                ? 'border-primary bg-primary text-primary-foreground' 
                : 'border-gray-300 text-gray-300'
              }`}>
                2
              </div>
            </div>
            <p className="text-sm text-gray-600">Step {step} of 2</p>
          </div>
          {step === 1 ? (
            <JobListingInput 
              onScrape={handleScrape}
              onSubmit={handleJobDescriptionSubmit}
              jobDescription={jobDescription}
              setJobDescription={setJobDescription}
              isLoading={isLoading}
            />
          ) : (
            <>
              <JobDetails 
                jobDescription={jobDescription} 
                isLoading={isLoading} 
                setIsLoading={setIsLoading}
              />
              {!isLoading && (
                <div className="mt-6">
                  <button 
                    className="px-4 py-2 border rounded hover:bg-gray-50"
                    onClick={handleStartOver}
                  >
                    Start Over
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  )
}

export default HirePage
