import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeftIcon, HomeIcon, SewingPinIcon, PersonIcon, LaptopIcon } from '@radix-ui/react-icons'
import * as Card from '@/components/ui/card'

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

interface JobDetailsProps {
  jobDescription: string
  parsedJob: ParsedJob | null
  onBack: () => void
}

export default function JobDetails({ jobDescription, parsedJob, onBack }: JobDetailsProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  const handleStartInterview = () => {
    console.log('Starting interview with:', { name, email, phone })
  }

  if (!parsedJob) {
    console.log('No parsed job data available')
    return null
  }

  console.log('Rendering JobDetails with parsed data:', parsedJob)

  const formatSalary = (salary: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(salary)
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        {/* <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeftIcon className="h-4 w-4" />
        </Button> */}
        <h2 className="text-2xl font-semibold">{parsedJob.job_title}</h2>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Left Column - Job Information */}
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <HomeIcon className="h-4 w-4" />
              <span>{parsedJob.company}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <SewingPinIcon className="h-4 w-4" />
              <span>{parsedJob.job_location}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <PersonIcon className="h-4 w-4" />
              <span>{parsedJob.seniority}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <LaptopIcon className="h-4 w-4" />
              <span>{parsedJob.remote_friendly ? 'Remote Friendly' : 'On-site'}</span>
            </div>
          </div>

          {parsedJob.salary > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-2">Salary</h3>
              <p className="text-2xl font-bold text-primary">{formatSalary(parsedJob.salary)}</p>
            </div>
          )}

          <div>
            <h3 className="text-lg font-medium mb-2">Description</h3>
            <p className="whitespace-pre-wrap text-muted-foreground">{parsedJob.job_description}</p>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Requirements</h3>
            <ul className="list-disc pl-5 space-y-1">
              {parsedJob.requirements.map((req, index) => (
                <li key={index} className="text-muted-foreground">{req}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Responsibilities</h3>
            <ul className="list-disc pl-5 space-y-1">
              {parsedJob.responsibilities.map((resp, index) => (
                <li key={index} className="text-muted-foreground">{resp}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column - Candidate Form */}
        <div>
          <Card.Card>
            <Card.CardHeader>
              <Card.CardTitle>Begin Your Interview</Card.CardTitle>
              <Card.CardDescription>
                Fill in your details below to start the AI-powered phone screening process
              </Card.CardDescription>
            </Card.CardHeader>
            <Card.CardContent>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">
                      Full Name
                    </label>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email Address
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm font-medium">
                      Phone Number
                    </label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(555) 555-5555"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleStartInterview}
                    disabled={!name || !email || !phone}
                  >
                    Start Phone Screen
                  </Button>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">
                      We've analyzed the job post and generated an appropriate phone screen.
                      Our AI recruiter will call you to conduct the interview and provide immediate feedback.
                    </p>
                  </div>
                </div>
              </form>
            </Card.CardContent>
          </Card.Card>
        </div>
      </div>
    </div>
  )
}
