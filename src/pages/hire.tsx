import { useState, useEffect } from 'react'
import type { NextPage } from 'next'
import JobListingInput from '@/components/hire/JobListingInput'
import JobDetails from '@/components/hire/JobDetails'
import InterviewInProgress from '@/components/hire/InterviewInProgress'
import { useToast } from '@/components/ui/use-toast'
import LoadingSteps from '@/components/hire/LoadingSteps'
import { FileTextIcon, ChatBubbleIcon, RocketIcon, ArrowRightIcon } from '@radix-ui/react-icons'
import { Button } from '@/components/ui/button'
import { usePostHog } from 'posthog-js/react'
import Head from 'next/head' // Import Head for metadata


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
  candidate: {
    name: string
    email: string
    linkedinUrl: string
    hiringManagerEmail: string
  }
}

const HirePage: NextPage = () => {
  const [showWizard, setShowWizard] = useState(false)
  const [step, setStep] = useState(1)
  const [jobDescription, setJobDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [jobUrl, setJobUrl] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [parsedJob, setParsedJob] = useState<ParsedJob | null>(null)
  const [candidateDetails, setCandidateDetails] = useState({
    name: '',
    email: '',
    phone: '',
    linkedinUrl: '',
    hiringManagerEmail: ''
  })
  const { toast } = useToast()
  const posthog = usePostHog()

  // Track wizard start
  useEffect(() => {
    if (showWizard) {
      posthog.capture('Hiring Wizard Started', {
        step: 1,
        has_job_url: Boolean(jobUrl),
        $current_url: window.location.href
      })
    }
  }, [showWizard, jobUrl, posthog])

  // Track step changes
  useEffect(() => {
    if (step > 1) {
      posthog.capture('Hiring Wizard Step Changed', {
        step,
        has_parsed_job: Boolean(parsedJob),
        has_candidate_details: Boolean(candidateDetails.email),
        $current_url: window.location.href
      })
    }
  }, [step, parsedJob, candidateDetails.email, posthog])

  const handleScrape = async () => {
    setIsLoading(true)
    posthog.capture('Job URL Scrape Attempted', {
      url: jobUrl,
      $current_url: window.location.href
    })
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
      
      if (data.jobDescription) {
        posthog.capture('Job URL Scrape Completed', {
          success: true,
          url: jobUrl,
          description_length: data.jobDescription.length,
          $current_url: window.location.href
        })
      } else {
        throw new Error('No job description found')
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        toast({
          title: "Timeout",
          description: "The request took too long. Please paste the job description directly.",
          variant: "destructive"
        })
      } else {
        toast({
          title: "Error",
          description: "Please copy and paste the job description directly into the text area.",
          variant: "destructive"
        })
      }
      console.error('Error scraping job:', error)
      posthog.capture('Job URL Scrape Failed', {
        error: error instanceof Error ? error.message : String(error),
        url: jobUrl,
        $current_url: window.location.href
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartInterview = async () => {
    if (!jobDescription.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a job description',
        variant: 'destructive'
      })
      return
    }

    setIsProcessing(true)
    posthog.capture('Job Description Submitted', {
      description_length: jobDescription.length,
      has_job_url: Boolean(jobUrl),
      $current_url: window.location.href
    })

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
      posthog.capture('Job Description Parsed', {
        success: true,
        company: parsedData.company,
        job_title: parsedData.job_title,
        has_requirements: Boolean(parsedData.requirements?.length),
        question_count: parsedData.interview_questions?.length,
        $current_url: window.location.href
      })

      // Step 3: Crafting interview strategy
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Step 4: Generating questions
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Step 5: Finalizing preparation
      await new Promise(resolve => setTimeout(resolve, 2000))

      setStep(2)
    } catch (error) {
      console.error('Error in handleStartInterview:', error)
      posthog.capture('Job Description Parse Failed', {
        error: error instanceof Error ? error.message : String(error),
        $current_url: window.location.href
      })
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
    setCandidateDetails({
      name: '',
      email: '',
      phone: '',
      linkedinUrl: '',
      hiringManagerEmail: ''
    })
  }

  

  if (!showWizard) {
    return (
      <>
        <Head>
          <title>Hire Top Talent with AI-Powered Interviews</title>
          <meta name="description" content="AI Agent interviews you for your dream job, provides feedback and even sends your interview to the hiring team for consideration." />
          <meta name="keywords" content="AI Agent Recruiting, hiring, AI interviews, job recruitment, phone screen, hiring automation, interview practice, interview prep" />
          <meta name="author" content="PhoneScreen.AI" />
          <meta property="og:title" content="AI Interview Agent" />
          <meta property="og:description" content="AI Agent interviews you for your dream job, provides feedback and even sends your interview to the hiring team for consideration." />
          <meta property="og:url" content="https://crackedhire.com" />
          <meta property="og:type" content="website" />
          <meta property="og:image" content="https://app.phonescreen.ai/logos/cracked.png" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <div className="min-h-screen bg-background flex flex-col">
          <main className="flex-1 flex flex-col items-center justify-center p-4">
            <div className="max-w-4xl w-full space-y-12 text-center">
              <div className="space-y-6">
                <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
                  Land Your{" "}
                  <span className="relative inline-block animate-fade-in">
                    <span className="absolute -inset-3 bg-gradient-to-r from-primary/40 via-primary/30 to-primary/20 rounded-xl blur-lg animate-pulse"></span>
                    <span className="relative inline-block">
                      <span className="text-primary font-black bg-clip-text bg-gradient-to-r from-primary via-primary/90 to-primary bg-[length:200%_auto] animate-gradient">
                        Dream Job
                      </span>
                    </span>
                  </span>
                  {" "}Faster with AI-Powered Interviews
                </h1>
                <p className="text-xl leading-relaxed text-foreground/80 max-w-2xl mx-auto">
                  Our AI Agent interviews you, fast-tracking your way to getting hired. Share your details, 
                  take the interview, and we&apos;ll do the rest.
                </p>
              </div>

              {/* Mobile-only CTA */}
              <div className="block md:hidden">
                <Button 
                  onClick={() => setShowWizard(true)}
                  size="lg"
                  className="relative group w-full py-7 text-lg shadow-lg shadow-primary/10"
                >
                  <span className="absolute inset-0 bg-primary/10 group-hover:bg-primary/20 transition-colors rounded-md"></span>
                  Get Your Dream Job
                  <ArrowRightIcon className="ml-2 h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </div>

              <div className="grid gap-10 md:grid-cols-3 text-left md:text-left text-center">
                <div className="space-y-3 flex flex-col items-center md:items-start">
                  <div className="relative">
                    <div className="h-14 w-14 max-[768px]:h-16 max-[768px]:w-16 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shadow-lg shadow-primary/5">
                      <FileTextIcon className="h-7 w-7 max-[768px]:h-8 max-[768px]:w-8 text-primary" aria-hidden="true" />
                    </div>
                    <div className="absolute -inset-1 bg-gradient-to-br from-primary/30 via-primary/20 to-transparent rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                  <h3 className="text-xl font-semibold max-[768px]:font-bold">1. Share Job Details</h3>
                  <p className="text-base text-foreground/75 leading-relaxed max-[768px]:leading-loose">
                    Paste the job description or URL. We&apos;ll create a personalized interview tailored to the role.
                  </p>
                </div>
                <div className="space-y-3 flex flex-col items-center md:items-start">
                  <div className="relative">
                    <div className="h-14 w-14 max-[768px]:h-16 max-[768px]:w-16 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shadow-lg shadow-primary/5">
                      <ChatBubbleIcon className="h-7 w-7 max-[768px]:h-8 max-[768px]:w-8 text-primary" aria-hidden="true" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold max-[768px]:font-bold">2. Take the Interview</h3>
                  <p className="text-base text-foreground/75 leading-relaxed max-[768px]:leading-loose">
                    Our AI Agent calls you and conducts a professional phone screen.
                  </p>
                </div>
                <div className="space-y-3 flex flex-col items-center md:items-start">
                  <div className="relative">
                    <div className="h-14 w-14 max-[768px]:h-16 max-[768px]:w-16 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shadow-lg shadow-primary/5">
                      <RocketIcon className="h-7 w-7 max-[768px]:h-8 max-[768px]:w-8 text-primary" aria-hidden="true" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold max-[768px]:font-bold">3. Get Hired</h3>
                  <p className="text-base text-foreground/75 leading-relaxed max-[768px]:leading-loose">
                    We&apos;ll email your recording and transcript directly to hiring teams to fast-track your application.
                  </p>
                </div>
              </div>

              {/* Desktop CTA */}
              <div className="hidden md:block space-y-4">
                <p className="text-lg font-medium text-foreground/90">
                  Don&apos;t wait—your dream job is just a call away!
                </p>
                <Button 
                  onClick={() => setShowWizard(true)}
                  size="lg"
                  className="relative group px-8 py-6 text-lg shadow-lg shadow-primary/10"
                >
                  <span className="absolute inset-0 bg-primary/10 group-hover:bg-primary/20 transition-colors rounded-md"></span>
                  Get Your Dream Job
                  <ArrowRightIcon className="ml-2 h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </div>

              <div className="space-y-3 pt-8 border-t">
                <p className="text-sm max-[768px]:text-base font-medium">Powered by PhoneScreen.AI</p>
                <p className="text-sm max-[768px]:text-base text-muted-foreground">
                  Trusted by job seekers applying to Google, Meta, Amazon, and more. Join thousands getting hired faster with PhoneScreen.AI.
                </p>
              </div>
            </div>
          </main>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-background">
        <style jsx>{`
          @keyframes expand {
            from {
              transform: scaleX(0);
            }
            to {
              transform: scaleX(1);
            }
          }
        `}</style>
        <main className="container py-6 px-4 sm:px-6">

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
          ) : step === 2 ? (
            <JobDetails
              jobDescription={jobDescription}
              parsedJob={parsedJob}
              onBack={() => setStep(1)}
              onComplete={(details) => {
                setCandidateDetails(details)
                setStep(3)
                posthog.capture('Candidate Details Submitted', {
                  has_linkedin: Boolean(details.linkedinUrl),
                  has_hiring_manager: Boolean(details.hiringManagerEmail)
                })
              }}
            />
          ) : (
            <InterviewInProgress
              jobTitle={parsedJob?.job_title}
              companyName={parsedJob?.company}
              candidateName={candidateDetails.name}
              candidateEmail={candidateDetails.email}
              linkedinUrl={candidateDetails.linkedinUrl}
              hiringManagerEmail={candidateDetails.hiringManagerEmail}
            />
          )}
        </main>
      </div>
    </>
  )
}

export default HirePage
