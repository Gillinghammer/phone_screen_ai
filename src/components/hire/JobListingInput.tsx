import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

interface JobListingInputProps {
  onScrape: (url: string) => Promise<void>
  onSubmit: (jobDescription: string) => void
  jobDescription: string
  setJobDescription: (description: string) => void
  isLoading: boolean
}

export default function JobListingInput({ 
  onScrape, 
  onSubmit, 
  jobDescription, 
  setJobDescription,
  isLoading 
}: JobListingInputProps) {
  const [url, setUrl] = useState('')

  const handleSubmit = () => {
    onSubmit(jobDescription)
  }

  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <Input
          type="url"
          placeholder="Paste job listing URL here"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <Button onClick={() => onScrape(url)} disabled={isLoading || !url.trim()}>
          {isLoading ? 'Scraping...' : 'Scrape'}
        </Button>
      </div>
      <Textarea
        placeholder="Job description will appear here, or paste it manually"
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
        rows={10}
        className="min-h-[200px]"
      />
      <Button 
        className="w-full" 
        onClick={handleSubmit} 
        disabled={!jobDescription.trim()}
      >
        Get Interviewed
      </Button>
    </div>
  )
}
