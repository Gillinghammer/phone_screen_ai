import { RocketIcon, BellIcon, ClockIcon, HeartFilledIcon, HomeIcon, CheckCircledIcon } from '@radix-ui/react-icons'

interface InterviewInProgressProps {
  jobTitle?: string
  companyName?: string
  candidateName?: string
  candidateEmail?: string
  linkedinUrl?: string
  hiringManagerEmail?: string
}

export default function InterviewInProgress({
  jobTitle,
  companyName,
  candidateName,
  candidateEmail,
  linkedinUrl,
  hiringManagerEmail
}: InterviewInProgressProps) {
  return (
    <div className="space-y-12 max-w-4xl mx-auto">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
          Get Ready for Your AI-Powered Interview!
        </h2>
        <p className="text-lg text-foreground/80">
          Your phone screen is about to begin—here&apos;s how to prepare:
        </p>
      </div>

      <div className="grid gap-8">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 shadow-lg shadow-primary/5">
            <HomeIcon className="h-7 w-7 text-primary animate-[pulse_2s_infinite]" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Incoming Call</h3>
            <p className="text-base text-foreground/70 leading-relaxed">
              You&apos;ll receive a phone call shortly from our AI Agent. The call will come from a standard phone number.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 shadow-lg shadow-primary/5">
            <BellIcon className="h-7 w-7 text-primary" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Find a Quiet Place</h3>
            <p className="text-base text-foreground/70 leading-relaxed">
              Make sure you&apos;re in a quiet environment with good phone reception to focus on the conversation.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 shadow-lg shadow-primary/5">
            <ClockIcon className="h-7 w-7 text-primary" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Be Patient</h3>
            <p className="text-base text-foreground/70 leading-relaxed">
              Give the AI Agent time to respond. Feel free to ask for questions to be repeated if needed&mdash;our AI is here to help you succeed.
            </p>
          </div>
        </div>

        <div className="bg-primary/5 rounded-xl p-6 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <CheckCircledIcon className="h-6 w-6 text-primary" />
              <h3 className="text-lg font-semibold">What Happens Next</h3>
            </div>
            <p className="text-base text-foreground/70 leading-relaxed">
              After your interview, our AI will analyze and score your responses. If you&apos;re a good fit, we&apos;ll send your results&mdash;along with a recording 
              and transcript—to the hiring team to fast-track your application.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <HeartFilledIcon className="h-6 w-6 text-primary" />
              <h3 className="text-lg font-semibold">Good Luck!</h3>
            </div>
            <p className="text-base text-foreground/70 leading-relaxed">
              We&apos;re rooting for you! Let us know if you get an interview or land the job&mdash;we&apos;d love to celebrate with you.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6">
        <h3 className="font-semibold mb-6 text-lg">Interview Details</h3>
        <dl className="space-y-4">
          {companyName && (
            <div className="grid grid-cols-3 gap-4 items-center">
              <dt className="text-sm font-medium text-foreground/60">Company</dt>
              <dd className="text-base col-span-2">{companyName}</dd>
            </div>
          )}
          {jobTitle && (
            <div className="grid grid-cols-3 gap-4 items-center">
              <dt className="text-sm font-medium text-foreground/60">Job Title</dt>
              <dd className="text-base col-span-2">{jobTitle}</dd>
            </div>
          )}
          {candidateName && (
            <div className="grid grid-cols-3 gap-4 items-center">
              <dt className="text-sm font-medium text-foreground/60">Your Name</dt>
              <dd className="text-base col-span-2">{candidateName}</dd>
            </div>
          )}
          {candidateEmail && (
            <div className="grid grid-cols-3 gap-4 items-center">
              <dt className="text-sm font-medium text-foreground/60">Your Email</dt>
              <dd className="text-base col-span-2">{candidateEmail}</dd>
            </div>
          )}
          {linkedinUrl && (
            <div className="grid grid-cols-3 gap-4 items-center">
              <dt className="text-sm font-medium text-foreground/60">LinkedIn</dt>
              <dd className="text-base col-span-2">
                <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  {linkedinUrl}
                </a>
              </dd>
            </div>
          )}
          {hiringManagerEmail && (
            <div className="grid grid-cols-3 gap-4 items-center">
              <dt className="text-sm font-medium text-foreground/60">Hiring Manager</dt>
              <dd className="text-base col-span-2">{hiringManagerEmail}</dd>
            </div>
          )}
        </dl>
      </div>

      <div className="rounded-xl bg-yellow-50/50 border border-yellow-200/50 p-6">
        <p className="text-base text-yellow-800/90 leading-relaxed">
          <strong>IMPORTANT:</strong> While we&apos;ll do everything we can to help you, we can&apos;t guarantee you&apos;ll hear back from the company. 
          Best of luck&mdash;we&apos;re cheering you on!
        </p>
      </div>
    </div>
  )
}
