import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import LoadingSteps from './LoadingSteps'
import { Building2, MapPin, GraduationCap, Calendar, Target } from 'lucide-react'

interface JobDetailsProps {
  jobDescription: string
  isLoading: boolean
  setIsLoading: (isLoading: boolean) => void
}

export default function JobDetails({ 
  jobDescription, 
  isLoading, 
  setIsLoading 
}: JobDetailsProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setIsLoading(false)
      }, 8000)
      return () => clearTimeout(timer)
    }
  }, [isLoading, setIsLoading])

  const handleStartInterview = async () => {
    console.log('Starting interview for:', { name, email, phone })
  }

  if (isLoading) {
    return <LoadingSteps />
  }

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="h-fit">
          <CardHeader className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold">Senior Marketing Manager</h2>
              <div className="flex flex-wrap gap-2 mt-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Building2 className="w-4 h-4 mr-1" />
                  Tesla
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 mr-1" />
                  Palo Alto, CA
                </div>
              </div>
            </div>
            <p className="text-muted-foreground">
              We are seeking a highly motivated and experienced Senior Marketing Manager to join our team at Tesla.
              The ideal candidate will have a strong background in digital marketing, brand management, and team leadership.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Key Responsibilities</h3>
              </div>
              <Separator />
              <ul className="space-y-2 text-sm">
                <li className="flex gap-2">
                  <Badge variant="outline" className="h-fit">•</Badge>
                  Develop and implement comprehensive marketing strategies
                </li>
                <li className="flex gap-2">
                  <Badge variant="outline" className="h-fit">•</Badge>
                  Lead a team of marketing professionals
                </li>
                <li className="flex gap-2">
                  <Badge variant="outline" className="h-fit">•</Badge>
                  Analyze market trends and competitor activities
                </li>
                <li className="flex gap-2">
                  <Badge variant="outline" className="h-fit">•</Badge>
                  Manage budget and resource allocation for marketing initiatives
                </li>
                <li className="flex gap-2">
                  <Badge variant="outline" className="h-fit">•</Badge>
                  Collaborate with cross-functional teams to align marketing efforts
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Requirements</h3>
              </div>
              <Separator />
              <ul className="space-y-2 text-sm">
                <li className="flex gap-2">
                  <Badge variant="outline" className="h-fit">•</Badge>
                  Bachelor's degree in Marketing, Business, or related field
                </li>
                <li className="flex gap-2">
                  <Badge variant="outline" className="h-fit">•</Badge>
                  7+ years of experience in marketing (3+ years in senior role)
                </li>
                <li className="flex gap-2">
                  <Badge variant="outline" className="h-fit">•</Badge>
                  Strong analytical and problem-solving skills
                </li>
                <li className="flex gap-2">
                  <Badge variant="outline" className="h-fit">•</Badge>
                  Excellent communication and leadership abilities
                </li>
                <li className="flex gap-2">
                  <Badge variant="outline" className="h-fit">•</Badge>
                  Experience with digital marketing tools and platforms
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Experience</h3>
              </div>
              <Separator />
              <div className="text-sm text-muted-foreground">
                <p>Minimum 7 years of experience required with at least 3 years in a senior marketing role.
                Knowledge of the automotive industry is a plus.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-2xl font-bold">Candidate Details</h2>
            <p className="text-sm text-muted-foreground">
              Fill in your details below to start the AI-powered phone screening process
            </p>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
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
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
