import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ReloadIcon, Link2Icon, FileTextIcon, ArrowRightIcon } from '@radix-ui/react-icons'

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

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    setLocalUrl(url)
    setJobUrl(url)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link2Icon className="h-4 w-4" />
          <span>Enter job listing URL</span>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="https://..."
            value={localUrl}
            onChange={handleUrlChange}
            disabled={isLoading}
          />
          <Button 
            variant="secondary"
            onClick={onScrape} 
            disabled={isLoading || !localUrl}
          >
            {isLoading ? (
              <>
                <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                Scraping...
              </>
            ) : (
              'Scrape'
            )}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileTextIcon className="h-4 w-4" />
          <span>Or paste job description</span>
        </div>
        <Textarea
          placeholder="Paste the full job description here..."
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          className="min-h-[200px]"
          rows={10}
        />
      </div>

      <Button 
        onClick={onSubmit}
        disabled={!jobDescription.trim() || isLoading}
        className="w-full"
      >
        Get Interviewed
        <ArrowRightIcon className="ml-2 h-4 w-4" />
      </Button>
    </div>
  )
}
