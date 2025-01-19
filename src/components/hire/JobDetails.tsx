import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeftIcon, HomeIcon, SewingPinIcon, PersonIcon, LaptopIcon, InfoCircledIcon, ArrowRightIcon } from '@radix-ui/react-icons'
import * as Card from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { usePostHog } from 'posthog-js/react'

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
  onComplete: (details: {
    name: string
    email: string
    phone: string
    linkedinUrl: string
    hiringManagerEmail: string
    companyName: string
  }) => void
}

export default function JobDetails({ jobDescription, parsedJob, onBack, onComplete }: JobDetailsProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [hiringManagerEmail, setHiringManagerEmail] = useState('')
  const [isGuessing, setIsGuessing] = useState(false)
  const [consentInterview, setConsentInterview] = useState(false)
  const [consentRecording, setConsentRecording] = useState(false)
  const [consentContact, setConsentContact] = useState(false)
  const [consentQualified, setConsentQualified] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const posthog = usePostHog()

  const formRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (error && formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [error]);

  const handleFormChange = (field: string, value: string) => {
    switch (field) {
      case 'name':
        setName(value)
        break
      case 'email':
        setEmail(value)
        break
      case 'phone':
        setPhone(value)
        break
      case 'linkedin':
        setLinkedinUrl(value)
        break
      case 'hiringManager':
        setHiringManagerEmail(value)
        break
    }
    posthog.capture('Candidate Form Field Updated', {
      field,
      has_value: Boolean(value),
      $current_url: window.location.href
    })
  }

  const handleConsentChange = (field: string, value: boolean) => {
    switch (field) {
      case 'consent-interview':
        setConsentInterview(value)
        break
      case 'consent-recording':
        setConsentRecording(value)
        break
      case 'consent-contact':
        setConsentContact(value)
        break
      case 'consent-qualified':
        setConsentQualified(value)
        break
    }
    posthog.capture('Candidate Consent Updated', {
      field,
      value,
      $current_url: window.location.href
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Clear any previous errors

    posthog.capture('Candidate Details Form Submitted', {
      has_name: Boolean(name.trim()),
      has_email: Boolean(email.trim()),
      has_phone: Boolean(phone.trim()),
      has_linkedin: Boolean(linkedinUrl.trim()),
      has_hiring_manager: Boolean(hiringManagerEmail.trim()),
      has_company_name: Boolean(parsedJob?.company),
      all_consents_given: consentInterview && consentRecording && consentContact && consentQualified,
      $current_url: window.location.href
    })

    try {
      const candidateDetails = {
        name,
        email,
        phone,
        linkedinUrl,
        hiringManagerEmail,
        companyName: parsedJob?.company || '',
      }
      const response = await fetch('/api/create-and-apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyId: 12,
          userId: 17,
          jobTitle: parsedJob?.job_title ?? '',
          jobLocation: parsedJob?.job_location ?? '',
          jobDescription: parsedJob?.job_description ?? '',
          requirements: parsedJob?.requirements ?? [],
          responsibilities: parsedJob?.responsibilities ?? [],
          seniority: parsedJob?.seniority ?? '',
          salary: parsedJob?.salary ?? 0,
          remoteFriendly: parsedJob?.remote_friendly ?? false,
          interviewQuestions: parsedJob?.interview_questions ?? [],
          // Candidate details
          ...candidateDetails,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create job and application');
      }

      const data = await response.json();
      onComplete(candidateDetails);
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    }
  };

  useEffect(() => {
    posthog.capture('Candidate Consent Updated', {
      consent_ai: consentInterview,
      consent_recording: consentRecording,
      consent_no_contact: consentContact,
      consent_share_qualified: consentQualified,
      all_consents_given: consentInterview && consentRecording && consentContact && consentQualified,
      $current_url: window.location.href
    })
  }, [consentInterview, consentRecording, consentContact, consentQualified, posthog])

  useEffect(() => {
    const guessHiringEmail = async () => {
      if (parsedJob?.company && !hiringManagerEmail) {
        setIsGuessing(true)
        try {
          const response = await fetch('/api/guess-hiring-email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ company: parsedJob.company }),
          });

          if (response.ok) {
            const data = await response.json();
            setHiringManagerEmail(data.email);
          }
        } catch (error) {
          console.error('Error guessing hiring email:', error);
        } finally {
          setIsGuessing(false)
        }
      }
    };

    guessHiringEmail();
  }, [parsedJob?.company, hiringManagerEmail]);

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
    <div className="space-y-8 sm:space-y-10 max-w-4xl mx-auto" ref={formRef}>
      <div className="space-y-6 sm:space-y-8 bg-gradient-to-b from-white to-primary/[0.02] rounded-xl border shadow-sm p-6 sm:p-8">
        {error && (
          <div className="bg-destructive/10 border-l-4 border-destructive text-destructive p-4 rounded">
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold">Your Tailored Phone Screen is Ready</h2>
            <p className="text-base sm:text-xl text-foreground/80">
              We&apos;ve designed a challenging yet fair interview to help you stand out.
            </p>
          </div>
        </div>

        <div className="grid gap-6 sm:gap-8 lg:grid-cols-2">
          {/* Left Column - Job Information */}
          <div className="space-y-6">
            <div className="bg-primary/5 rounded-xl p-4 sm:p-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-2 text-sm sm:text-base text-foreground/80">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <HomeIcon className="h-4 w-4 text-primary" />
                  </div>
                  <span className="truncate">{parsedJob.company}</span>
                </div>
                <div className="flex items-center gap-2 text-sm sm:text-base text-foreground/80">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <SewingPinIcon className="h-4 w-4 text-primary" />
                  </div>
                  <span className="truncate">{parsedJob.job_location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm sm:text-base text-foreground/80">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <PersonIcon className="h-4 w-4 text-primary" />
                  </div>
                  <span className="truncate">{parsedJob.seniority}</span>
                </div>
                <div className="flex items-center gap-2 text-sm sm:text-base text-foreground/80">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <LaptopIcon className="h-4 w-4 text-primary" />
                  </div>
                  <span className="truncate">{parsedJob.remote_friendly ? 'Remote Friendly' : 'On-site'}</span>
                </div>
              </div>

              {parsedJob.salary > 0 && (
                <div className="pt-2 border-t">
                  <h3 className="text-base sm:text-lg font-medium mb-2">Salary Range</h3>
                  <p className="text-xl sm:text-2xl font-bold text-primary">{formatSalary(parsedJob.salary)}</p>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">Role Overview</h3>
                <p className="text-sm sm:text-base text-foreground/80 leading-relaxed">{parsedJob.job_description}</p>
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">Key Requirements</h3>
                <ul className="space-y-2">
                  {parsedJob.requirements.map((req, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm sm:text-base text-foreground/80">
                      <div className="h-6 w-6 rounded bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-primary text-xs sm:text-sm font-medium">{index + 1}</span>
                      </div>
                      <span className="leading-relaxed">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">Core Responsibilities</h3>
                <ul className="space-y-2">
                  {parsedJob.responsibilities.map((resp, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm sm:text-base text-foreground/80">
                      <div className="h-6 w-6 rounded bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-primary text-xs sm:text-sm font-medium">{index + 1}</span>
                      </div>
                      <span className="leading-relaxed">{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Right Column - Candidate Form */}
          <div>
            <Card.Card className="bg-white shadow-xl shadow-primary/5">
              <Card.CardHeader className="space-y-3 p-4 sm:p-6">
                <Card.CardTitle className="text-xl sm:text-2xl">Your Interview Details</Card.CardTitle>
                <Card.CardDescription className="text-sm sm:text-base text-foreground/80">
                  We&apos;ll create a personalized AI interview based on your information. Our AI recruiter will call you shortly after submission.
                </Card.CardDescription>
              </Card.CardHeader>
              <Card.CardContent>
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm sm:text-base font-medium flex items-center gap-2">
                        <PersonIcon className="h-4 w-4 text-primary" />
                        Full Name
                      </label>
                      <Input
                        id="name"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => handleFormChange('name', e.target.value)}
                        required
                        className="h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm sm:text-base font-medium flex items-center gap-2">
                        <svg className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Email Address
                      </label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        value={email}
                        onChange={(e) => handleFormChange('email', e.target.value)}
                        required
                        className="h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="phone" className="text-sm sm:text-base font-medium flex items-center gap-2">
                        <svg className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        Phone Number
                      </label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="(555) 555-5555"
                        value={phone}
                        onChange={(e) => handleFormChange('phone', e.target.value)}
                        required
                        className="h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="linkedin" className="text-sm sm:text-base font-medium flex items-center gap-2">
                        <svg className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
                          <circle cx="4" cy="4" r="2" />
                        </svg>
                        LinkedIn URL (Optional)
                      </label>
                      <Input
                        id="linkedin"
                        type="url"
                        placeholder="https://www.linkedin.com/in/johndoe"
                        value={linkedinUrl}
                        onChange={(e) => handleFormChange('linkedin', e.target.value)}
                        className="h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="hiringManager" className="text-sm sm:text-base font-medium flex items-center gap-2">
                        <InfoCircledIcon className="h-4 w-4 text-primary" />
                        Hiring Manager Email (Optional)
                      </label>
                      <Input
                        id="hiringManager"
                        type="email"
                        placeholder={isGuessing ? "Finding best contact..." : "manager@company.com"}
                        value={hiringManagerEmail}
                        onChange={(e) => handleFormChange('hiringManager', e.target.value)}
                        disabled={isGuessing}
                        className="h-12"
                      />
                      <p className="text-sm sm:text-base text-yellow-800/90 bg-yellow-50/50 p-3 rounded-lg flex items-start gap-2 border border-yellow-200/50">
                        <InfoCircledIcon className="h-4 w-4 flex-shrink-0 mt-0.5 text-yellow-800/70" />
                        We&apos;ll automatically send your interview results to the right hiring team and copy you on the email. If you know a specific recruiter&apos;s email at the company, add it here instead.<br /><br />Leave blank if you don&apos;t want to share your results.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t">
                    <h4 className="text-base sm:text-lg font-semibold">Interview Consent</h4>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id="consent-interview"
                          checked={consentInterview}
                          onCheckedChange={(checked) => handleConsentChange('consent-interview', checked as boolean)}
                          className="mt-1"
                        />
                        <label htmlFor="consent-interview" className="text-sm sm:text-base text-foreground/80 leading-relaxed">
                          I consent to having an AI-powered phone interview and understand that my responses will be analyzed by AI.
                        </label>
                      </div>
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id="consent-recording"
                          checked={consentRecording}
                          onCheckedChange={(checked) => handleConsentChange('consent-recording', checked as boolean)}
                          className="mt-1"
                        />
                        <label htmlFor="consent-recording" className="text-sm sm:text-base text-foreground/80 leading-relaxed">
                          I consent to having my interview recorded for quality assurance and training purposes.
                        </label>
                      </div>
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id="consent-contact"
                          checked={consentContact}
                          onCheckedChange={(checked) => handleConsentChange('consent-contact', checked as boolean)}
                          className="mt-1"
                        />
                        <label htmlFor="consent-contact" className="text-sm sm:text-base text-foreground/80 leading-relaxed">
                          I understand that PhoneScreen.AI will not contact me for marketing purposes or share my information with third parties.
                        </label>
                      </div>
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id="consent-qualified"
                          checked={consentQualified}
                          onCheckedChange={(checked) => handleConsentChange('consent-qualified', checked as boolean)}
                          className="mt-1"
                        />
                        <label htmlFor="consent-qualified" className="text-sm sm:text-base text-foreground/80 leading-relaxed">
                          I confirm that I meet the basic qualifications for this role and am actively seeking employment.
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onBack}
                      className="w-full sm:w-auto h-10 sm:h-12"
                    >
                      <ArrowLeftIcon className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={
                        !name || 
                        !email || 
                        !phone || 
                        !consentInterview || 
                        !consentRecording || 
                        !consentContact || 
                        !consentQualified ||
                        !!error
                      }
                      className="w-full sm:w-auto h-10 sm:h-12 font-medium"
                    >
                      Start Your Interview
                      <ArrowRightIcon className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </Card.CardContent>
            </Card.Card>
          </div>
        </div>
      </div>
    </div>
  )
}
