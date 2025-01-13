import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ReloadIcon, Link2Icon, FileTextIcon, ArrowRightIcon, LaptopIcon } from '@radix-ui/react-icons'
import { cn } from '@/lib/utils'

interface JobListingInputProps {
  jobDescription: string
  setJobDescription: (description: string) => void
  isLoading: boolean
  setJobUrl: (url: string) => void
  onScrape: () => Promise<void>
  onSubmit: () => Promise<void>
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
  const [focusedInput, setFocusedInput] = useState<'url' | 'description' | null>(null)

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    setLocalUrl(url)
    setJobUrl(url)
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="space-y-8 bg-gradient-to-b from-white to-primary/[0.02] rounded-xl border shadow-sm p-8">
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shadow-lg shadow-primary/5">
              <LaptopIcon className="h-7 w-7 text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Create Your Tailored Interview with AI</h2>
              <p className="text-lg text-foreground/80">
                Our AI will design a challenging yet fair interview to help you stand out.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Link2Icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Enter Job Listing URL</h3>
                <p className="text-foreground/70">Paste the job post link, and we&apos;ll analyze the details automatically.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Input
                  placeholder="https://www.company.com/jobs/..."
                  value={localUrl}
                  onChange={handleUrlChange}
                  disabled={isLoading}
                  className={cn(
                    "pl-10 h-12 bg-white transition-all duration-200",
                    focusedInput === 'url' ? "shadow-[0_0_0_3px_rgba(var(--primary),.25)] border-primary" : "hover:border-primary/50",
                    isLoading && "opacity-70"
                  )}
                  onFocus={() => setFocusedInput('url')}
                  onBlur={() => setFocusedInput(null)}
                />
                <Link2Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/60" />
              </div>
              <Button 
                variant="secondary"
                onClick={onScrape} 
                disabled={isLoading || !localUrl}
                className={cn(
                  "min-w-[120px] h-12 font-medium bg-primary/10 hover:bg-primary/20 text-primary",
                  isLoading && "opacity-70"
                )}
              >
                {isLoading ? (
                  <>
                    <ReloadIcon className="mr-2 h-5 w-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <FileTextIcon className="mr-2 h-5 w-5" />
                    Analyze URL
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="relative space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileTextIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Or Paste Job Description</h3>
                <p className="text-foreground/70">Copy and paste the full job description here if you don&apos;t have a URL.</p>
              </div>
            </div>
            <div className="relative">
              <Textarea
                placeholder="Paste the complete job description including requirements, responsibilities, and qualifications..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className={cn(
                  "min-h-[240px] pl-4 py-4 bg-white resize-none transition-all duration-200",
                  focusedInput === 'description' ? "shadow-[0_0_0_3px_rgba(var(--primary),.25)] border-primary" : "hover:border-primary/50"
                )}
                onFocus={() => setFocusedInput('description')}
                onBlur={() => setFocusedInput(null)}
                rows={10}
              />
              <div className="absolute right-3 bottom-3 text-xs text-foreground/50">
                {jobDescription.length} characters
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-primary/5 rounded-xl p-4 flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <svg className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div className="flex-1 text-base text-foreground/80 leading-relaxed">
            Once you submit, our AI will analyze the role and create a tailored interview experience. 
            We&apos;ll focus on the key requirements and responsibilities to ensure a relevant conversation.
          </div>
        </div>

        <Button 
          onClick={onSubmit}
          disabled={!jobDescription.trim() || isLoading}
          className="w-full h-14 text-lg font-medium bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary transition-all duration-300 shadow-lg shadow-primary/10"
        >
          Create My AI Interview Now
          <ArrowRightIcon className="ml-2 h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
        </Button>
      </div>
    </div>
  )
}
