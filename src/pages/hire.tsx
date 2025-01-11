import { useState } from 'react'
import type { NextPage } from 'next'
import JobListingInput from '@/components/hire/JobListingInput'
import JobDetails from '@/components/hire/JobDetails'
import { useToast } from '@/components/ui/use-toast'
import LoadingSteps from '@/components/hire/LoadingSteps'
import { FileTextIcon, ChatBubbleIcon } from '@radix-ui/react-icons'

interface ParsedJob {
  company: string
  job_title: string
  job_location: string
  job_description: string
  remote_friendly: boolean
  seniority: string
  salary: number
  requirements: string[]
  responsibilities: string[]
  interview_questions: string[]
}

const HirePage: NextPage = () => {
  const [step, setStep] = useState(1)
  const [jobDescription, setJobDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [jobUrl, setJobUrl] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [parsedJob, setParsedJob] = useState<ParsedJob | null>(null)
  const { toast } = useToast()

  const handleScrape = async () => {
    setIsLoading(true)
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      const response = await fetch('/api/scrape-job', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: jobUrl }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error('Failed to scrape job')
      }

      const data = await response.json()
      setJobDescription(data.jobDescription)
    } catch (error) {
      if (error.name === 'AbortError') {
        toast({
          title: "Scraping took too long",
          description: "Please copy and paste the job description directly into the text area.",
          variant: "destructive"
        })
      } else {
        toast({
          title: "Error scraping job",
          description: "Please copy and paste the job description directly into the text area.",
          variant: "destructive"
        })
      }
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartInterview = async () => {
    setIsProcessing(true)
    
    try {
      console.log('Starting interview process with job description:', jobDescription)
      
      // Step 1: Analyzing job description
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Step 2: Parse job details
      console.log('Sending parse request to server...')
      const parseResponse = await fetch('/api/parse-job', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ details: jobDescription })
      })

      console.log('Parse response status:', parseResponse.status)
      
      if (!parseResponse.ok) {
        const errorData = await parseResponse.json()
        console.error('Parse response error:', errorData)
        throw new Error('Failed to parse job details')
      }

      const parsedData = await parseResponse.json()
      console.log('Received parsed job data:', parsedData)
      setParsedJob(parsedData)

      // Step 3: Crafting interview strategy
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Step 4: Generating questions
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Step 5: Finalizing preparation
      await new Promise(resolve => setTimeout(resolve, 2000))

      setStep(2)
    } catch (error) {
      console.error('Error in handleStartInterview:', error)
      toast({
        title: "Error preparing interview",
        description: "Failed to analyze the job description. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleStartOver = () => {
    setJobDescription('')
    setJobUrl('')
    setStep(1)
    setIsLoading(false)
    setIsProcessing(false)
    setParsedJob(null)
  }

  return (
    <main className="container mx-auto p-4">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-6">AI Interview Agent</h1>
          <div className="mb-8 flex justify-between items-center">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition-colors ${
                  step === 1 
                  ? 'border-primary bg-primary text-primary-foreground' 
                  : 'border-gray-300 text-gray-300'
                }`}>
                  <FileTextIcon className="h-4 w-4" />
                </div>
                <div className="hidden sm:block">
                  <p className="font-medium">Job Details</p>
                  <p className="text-sm text-muted-foreground">Enter job information</p>
                </div>
              </div>

              <div className="h-px w-12 bg-gray-200" />

              <div className="flex items-center gap-2">
                <div className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition-colors ${
                  step === 2 
                  ? 'border-primary bg-primary text-primary-foreground' 
                  : 'border-gray-300 text-gray-300'
                }`}>
                  <ChatBubbleIcon className="h-4 w-4" />
                </div>
                <div className="hidden sm:block">
                  <p className="font-medium">Interview</p>
                  <p className="text-sm text-muted-foreground">Complete phone screen</p>
                </div>
              </div>
            </div>
          </div>

          {isProcessing ? (
            <LoadingSteps />
          ) : step === 1 ? (
            <JobListingInput
              jobDescription={jobDescription}
              setJobDescription={setJobDescription}
              isLoading={isLoading}
              setJobUrl={setJobUrl}
              onScrape={handleScrape}
              onSubmit={handleStartInterview}
            />
          ) : (
            <>
              <JobDetails
                jobDescription={jobDescription}
                parsedJob={parsedJob}
                onBack={() => setStep(1)}
              />
              <div className="mt-6">
                <button 
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                  onClick={handleStartOver}
                >
                  Start Over
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  )
}

export default HirePage
