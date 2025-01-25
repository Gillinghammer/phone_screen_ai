import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  ReloadIcon, 
  Link2Icon, 
  GlobeIcon,
  FileTextIcon,
  ArrowRightIcon, 
  LaptopIcon, 
  ChevronDownIcon,
  RocketIcon
} from '@radix-ui/react-icons'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// Single responsibility: Define job data structure
interface JobRole {
  company: string
  logo: string
  roles: Array<{
    title: string
    descriptionFile: string
  }>
}

const SAMPLE_JOBS: JobRole[] = [
  {
    company: 'Google',
    logo: '/companies/google.svg',
    roles: [
      { title: 'Senior Product Manager', descriptionFile: '/jobs/google-product-manager.txt' },
      { title: 'Enterprise Sales Executive', descriptionFile: '/jobs/google-sales-executive.txt' },
      { title: 'People Operations Director', descriptionFile: '/jobs/google-people-ops.txt' }
    ]
  },
  {
    company: 'Tesla',
    logo: '/companies/tesla.svg',
    roles: [
      { title: 'Software Engineering Manager', descriptionFile: '/jobs/tesla-engineering-manager.txt' },
      { title: 'Marketing Director', descriptionFile: '/jobs/tesla-marketing-director.txt' },
      { title: 'Finance Manager', descriptionFile: '/jobs/tesla-finance-manager.txt' }
    ]
  },
  {
    company: 'Apple',
    logo: '/companies/apple.svg',
    roles: [
      { title: 'Product Manager, iOS', descriptionFile: '/jobs/apple-product-manager.txt' },
      { title: 'Sales Strategy Manager', descriptionFile: '/jobs/apple-sales-strategy.txt' },
      { title: 'HR Business Partner', descriptionFile: '/jobs/apple-hr-partner.txt' }
    ]
  },
  {
    company: 'Meta',
    logo: '/companies/meta.svg',
    roles: [
      { title: 'Engineering Director', descriptionFile: '/jobs/meta-engineering-director.txt' },
      { title: 'Global Account Executive', descriptionFile: '/jobs/meta-account-executive.txt' },
      { title: 'Compensation Manager', descriptionFile: '/jobs/meta-compensation-manager.txt' }
    ]
  }
]

// Single responsibility: Header component
function Header() {
  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex items-center gap-5">
        <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shadow-lg shadow-primary/5 flex-shrink-0 mt-1">
          <LaptopIcon className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
        </div>
        <div className="space-y-2 sm:space-y-3 flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl sm:text-2xl font-bold leading-tight">Create Your Tailored Interview with AI</h2>
            </div>
          </div>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Share a job posting to generate a customized technical interview. We&apos;ll analyze the requirements and create relevant questions.
          </p>
        </div>
      </div>
    </div>
  )
}

// Single responsibility: URL input section with error handling
interface UrlInputProps {
  url: string
  isLoading: boolean
  error: string | null
  onUrlChange: (url: string) => void
  onAnalyze: () => void
}

function UrlInput({ url, isLoading, error, onUrlChange, onAnalyze }: UrlInputProps) {
  return (
    <div className="bg-gray-100 rounded-lg border shadow-sm p-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Link2Icon className="h-5 w-5" />
            <span className="text-base font-medium">Paste Job Link</span>
          </div>
          <p className="text-base text-muted-foreground">
            Paste the link to any job posting, and we&apos;ll automatically extract the details to build your interview.
          </p>
        </div>
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              type="url"
              placeholder="e.g., https://www.company.com/careers/senior-engineer"
              value={url}
              onChange={(e) => onUrlChange(e.target.value)}
              className={cn(
                "flex-1 h-11 text-base px-4",
                "focus:ring-2 focus:ring-primary/20 focus:border-primary",
                error && "border-red-300 focus:border-red-400 focus:ring-red-200",
                "placeholder:text-muted-foreground/50",
                "bg-white rounded-lg"
              )}
            />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="default"
                    size="lg"
                    className={cn(
                      "sm:w-auto h-11 text-base font-medium gap-2",
                      "shadow-sm hover:shadow-md transition-all",
                      "bg-primary text-primary-foreground",
                      "hover:bg-primary/90 hover:scale-[1.02]",
                      "rounded-lg"
                    )}
                    onClick={onAnalyze}
                    disabled={isLoading || !url}
                  >
                    {isLoading ? (
                      <>
                        <div className="relative h-5 w-5">
                          <div className="absolute inset-0">
                            <ReloadIcon className="h-5 w-5 animate-spin" />
                          </div>
                          <div className="absolute inset-0 animate-pulse opacity-50">
                            <ReloadIcon className="h-5 w-5" />
                          </div>
                        </div>
                        <span className="text-base">Analyzing</span>
                      </>
                    ) : (
                      <>
                        <GlobeIcon className="h-5 w-5" />
                        <span className="text-base">Analyze Job Link</span>
                      </>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="rounded-lg">
                  We&apos;ll extract details from this link automatically to craft your custom interview.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-500">
              <div className="h-4 w-4 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-medium">!</span>
              </div>
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Single responsibility: Job description input with improved spacing
interface DescriptionInputProps {
  description: string
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onDescriptionChange: (description: string) => void
}

function DescriptionInput({ description, isOpen, onOpenChange, onDescriptionChange }: DescriptionInputProps) {
  return (
    <div className="space-y-2">
      <div className="text-base font-medium text-muted-foreground">
        No job link available? No problem! You can paste the job description directly or choose from popular roles below.
      </div>
      <Collapsible
        open={isOpen}
        onOpenChange={onOpenChange}
        className="bg-gray-100 rounded-lg border shadow-sm"
      >
        <CollapsibleTrigger className="flex items-center justify-between w-full p-4 text-left hover:bg-gray-200 transition-colors rounded-lg">
          <div className="flex items-center gap-2">
            <FileTextIcon className="h-5 w-5 text-muted-foreground" />
            <span className="text-base font-medium">Can&apos;t Use a Link?</span>
          </div>
          <ChevronDownIcon className={cn(
            "h-5 w-5 text-muted-foreground transition-transform",
            isOpen && "transform rotate-180"
          )} />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="p-4 pt-6 space-y-3 bg-gray-200 border-t">
            <p className="text-base text-muted-foreground">
              <span className="font-medium">Paste the full job description directly here</span> if you don&apos;t have a job link available.
            </p>
            <Textarea
              placeholder="Paste the full job description here..."
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              className={cn(
                "min-h-[200px] text-base leading-relaxed p-4 bg-white",
                "focus:ring-2 focus:ring-primary/20 focus:border-primary",
                "placeholder:text-muted-foreground/50",
                "rounded-lg"
              )}
            />
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}

// Single responsibility: Sample roles selector with category labels
interface RoleSelectorProps {
  selectedJob: string | null
  onJobSelect: (company: string, role: string) => void
}

function RoleSelector({ selectedJob, onJobSelect }: RoleSelectorProps) {
  return (
    <div className="space-y-2">
      <div className="text-base font-medium text-muted-foreground">
        Not sure where to start? Browse roles from leading companies to generate an example interview.
      </div>
      <div className="bg-gray-100 rounded-lg border shadow-sm p-4">
        <Select 
          onValueChange={(value) => {
            const [company, role] = value.split('|')
            onJobSelect(company, role)
          }}
        >
          <SelectTrigger className="w-full border-0 bg-transparent p-0 h-auto text-left shadow-none hover:bg-gray-200 transition-colors rounded-lg">
            <div className="flex items-center gap-2">
              <RocketIcon className="h-5 w-5 text-muted-foreground" />
              <SelectValue placeholder="Popular Roles" className="text-base" />
            </div>
          </SelectTrigger>
          <SelectContent className="rounded-lg">
            <div className="px-2 py-1.5 text-base font-medium text-muted-foreground/70">
              Popular Roles
            </div>
            {SAMPLE_JOBS.map((company, index) => (
              <SelectGroup key={company.company}>
                {index > 0 && <div className="h-px bg-border/50 mx-2 my-1" />}
                <SelectLabel className="flex items-center gap-2 py-1">
                  <div className="h-4 w-4 relative flex-shrink-0 opacity-80">
                    <Image
                      src={company.logo}
                      alt={company.company}
                      fill
                      className="object-contain rounded-lg"
                    />
                  </div>
                  <span className="text-base font-medium">{company.company}</span>
                </SelectLabel>
                {company.roles.map((role) => (
                  <SelectItem 
                    key={`${company.company}|${role.title}`} 
                    value={`${company.company}|${role.title}`}
                    className={cn(
                      "pl-6 text-base rounded-lg",
                      selectedJob === `${company.company} - ${role.title}` && "text-primary"
                    )}
                  >
                    {role.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}
                  </SelectItem>
                ))}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

// Main component composition with error handling
interface JobListingInputProps {
  jobDescription: string
  setJobDescription: (description: string) => void
  isLoading: boolean
  setJobUrl: (url: string) => void
  onScrape: () => void
  onSubmit: () => void
}

export default function JobListingInput({
  jobDescription,
  setJobDescription,
  isLoading,
  setJobUrl,
  onScrape,
  onSubmit
}: JobListingInputProps) {
  const [localUrl, setLocalUrl] = useState('')
  const [selectedJob, setSelectedJob] = useState<string | null>(null)
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false)

  const handleUrlChange = (url: string) => {
    setLocalUrl(url)
    setJobUrl(url)
  }

  const handleSampleJobSelect = async (company: string, role: string) => {
    setSelectedJob(`${company} - ${role}`)
    setIsDescriptionOpen(false)
    
    // Find the job description file path
    const companyData = SAMPLE_JOBS.find(job => job.company === company)
    const roleData = companyData?.roles.find(r => r.title === role)
    
    if (roleData) {
      try {
        const response = await fetch(roleData.descriptionFile)
        if (response.ok) {
          const description = await response.text()
          setJobDescription(description)
        } else {
          throw new Error('Failed to load job description')
        }
      } catch (error) {
        console.error('Error loading job description:', error)
        setJobDescription(`${role} position at ${company}\n\nError loading job description. Please try again.`)
      }
    }
    
    setLocalUrl('')
  }

  const handleAnalyze = () => {
    onScrape()
    setIsDescriptionOpen(true)
  }

  return (
    <div className="space-y-8 sm:space-y-10 max-w-4xl mx-auto">
      <Header />

      <div className="space-y-6 divide-y divide-gray-100">
        <div className="pb-6">
          <UrlInput 
            url={localUrl}
            isLoading={isLoading}
            error={null}
            onUrlChange={handleUrlChange}
            onAnalyze={handleAnalyze}
          />
        </div>

        <div className="space-y-3 pt-6">
          <DescriptionInput 
            description={jobDescription}
            isOpen={isDescriptionOpen}
            onOpenChange={setIsDescriptionOpen}
            onDescriptionChange={setJobDescription}
          />

          <RoleSelector 
            selectedJob={selectedJob}
            onJobSelect={handleSampleJobSelect}
          />
        </div>
      </div>

      <div className={cn(
        // Mobile styles (default)
        "bg-white p-6 rounded-lg shadow-sm border mt-8 space-y-4",
        // Medium and larger devices
        "sm:bg-transparent sm:p-0 sm:border-0 sm:shadow-none sm:mt-4 sm:sticky sm:bottom-4",
        "sm:bg-gradient-to-t sm:from-background sm:via-background sm:to-transparent sm:pb-4 sm:pt-8"
      )}>
        <div className="space-y-3 bg-white">
          <div className="space-y-1 text-center">
            <p className="text-base text-muted-foreground">
              Your AI generated interview will be tailored specifically for this job.
            </p>
            <p className="text-base font-medium text-muted-foreground">
              Click to start creating your interview!
            </p>
          </div>
          <Button
            className={cn(
              // Mobile styles (default)
              "w-full h-12 text-base font-medium gap-2",
              "shadow-sm hover:shadow-md transition-all",
              "bg-primary text-primary-foreground",
              "hover:bg-primary/90 hover:scale-[1.02]",
              "rounded-lg",
              // Medium and larger devices
              "sm:h-14",
              "sm:shadow-lg sm:hover:shadow-xl",
              "sm:active:scale-[0.98]"
            )}
            onClick={onSubmit}
            disabled={!jobDescription}
          >
            <span className="text-base">Generate Interview</span>
            <ArrowRightIcon className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
