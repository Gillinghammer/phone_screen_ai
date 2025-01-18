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
    <div className="space-y-8 sm:space-y-10 max-w-4xl mx-auto">
      <div className="space-y-6 sm:space-y-8 bg-gradient-to-b from-white to-primary/[0.02] rounded-xl border shadow-sm p-6 sm:p-8">
        <div className="space-y-4 sm:space-y-6">
          <div className="flex items-center gap-5">
            <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shadow-lg shadow-primary/5 flex-shrink-0 mt-1">
              <LaptopIcon className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
            </div>
            <div className="space-y-2 sm:space-y-3 flex-1">
              <h2 className="text-2xl sm:text-2xl font-bold leading-tight">Create Your Tailored Interview with AI</h2>
              <p className="hidden sm:block text-base sm:text-lg text-foreground/80 leading-relaxed">
                Our AI will design a challenging yet fair interview to help you stand out.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-8 sm:space-y-8">
          <div className="space-y-4">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center gap-2 text-lg sm:text-lg font-medium">
                <Link2Icon className="h-6 w-6 sm:h-5 sm:w-5" />
                Enter Job Listing URL
              </div>
              <p className="text-base sm:text-base text-foreground/60 leading-relaxed">
                Paste the job post link, and we'll analyze the details automatically.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-3">
              <Input
                type="url"
                placeholder="https://www.company.com/jobs/..."
                value={localUrl}
                onChange={handleUrlChange}
                className={cn(
                  "flex-1 h-14 sm:h-10 text-base sm:text-sm px-4 shadow-sm",
                  "focus:ring-2 focus:ring-primary/20 focus:border-primary"
                )}
              />
              <Button
                variant="outline"
                size="lg"
                className={cn(
                  "w-full sm:w-auto h-14 sm:h-10 text-base sm:text-sm font-medium",
                  "shadow-sm hover:shadow-md transition-shadow",
                  "active:scale-[0.98] transform transition-transform"
                )}
                onClick={onScrape}
                disabled={isLoading || !localUrl}
              >
                {isLoading ? (
                  <>
                    <ReloadIcon className="mr-2 h-6 w-6 sm:h-5 sm:w-5 animate-spin" />
                    Analyzing
                  </>
                ) : (
                  <>
                    <FileTextIcon className="mr-2 h-6 w-6 sm:h-5 sm:w-5" />
                    Analyze URL
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="relative py-8 sm:py-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-background px-6 sm:px-4 text-base sm:text-sm text-muted-foreground font-medium">OR</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center gap-2 text-lg sm:text-lg font-medium">
                <FileTextIcon className="h-6 w-6 sm:h-5 sm:w-5" />
                Or Paste Job Description
              </div>
              <p className="text-base sm:text-base text-foreground/60 leading-relaxed">
                Copy and paste the full job description here if you don't have a URL.
              </p>
            </div>
            
            <Textarea
              placeholder="Paste the full job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className={cn(
                "min-h-[200px] text-base sm:text-sm leading-relaxed p-4 shadow-sm",
                "focus:ring-2 focus:ring-primary/20 focus:border-primary"
              )}
            />
          </div>
        </div>
      </div>

      <div className="sticky bottom-4 sm:relative sm:bottom-0 px-4 -mx-4 sm:px-0 sm:mx-0 bg-gradient-to-t from-background via-background to-transparent pb-4 pt-8 sm:pb-0 sm:pt-0">
        <Button
          className={cn(
            "w-full h-14 sm:h-12 text-base sm:text-sm font-medium",
            "shadow-lg hover:shadow-xl transition-shadow",
            "active:scale-[0.98] transform transition-transform"
          )}
          onClick={onSubmit}
          disabled={isLoading || (!jobDescription && !localUrl)}
        >
          Generate Interview
          <ArrowRightIcon className="ml-2 h-6 w-6 sm:h-5 sm:w-5" />
        </Button>
      </div>
    </div>
  )
}
