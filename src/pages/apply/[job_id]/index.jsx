import { useState, useEffect } from "react";
import { PrismaClient } from "@prisma/client";
import { track } from "@vercel/analytics";
import { Card } from "@/components/ui/card";
import Head from "next/head";
import { useTheme } from "next-themes";
import { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import PhoneInput from "react-phone-number-input";
import {
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
const prisma = new PrismaClient();

const JobPage = ({ job }) => {
  const { setTheme } = useTheme();
  const [applicantDetails, setApplicantDetails] = useState({
    name: "",
    email: "",
    phone: "",
    resumeUrl: "",
    jobId: job.id,
  });
  const [videoPlayed, setVideoPlayed] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    setTheme("light");
  }, [setTheme]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setApplicantDetails({ ...applicantDetails, [name]: value });
  };

  const isFormValid = () => {
    const nameRegex = /^[A-Za-z\s]+$/;
    const phoneRegex = /^\+?\d{10,14}$/;

    if (!applicantDetails.name || !nameRegex.test(applicantDetails.name)) {
      return false;
    }

    if (!applicantDetails.email) {
      return false;
    }

    if (
      !applicantDetails.phone ||
      !isValidPhoneNumber(applicantDetails.phone)
    ) {
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (isFormValid()) {
      try {
        setIsDialogOpen(false);
        const response = await fetch("/api/apply", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ...applicantDetails, jobId: job.id, job }),
        });

        if (response.ok) {
          track("Candidate application", {
            ...applicantDetails,
            jobId: job.id,
            jobTitle: job.jobTitle,
            company: job.company,
          });
          setApplicantDetails({
            name: "",
            email: "",
            phone: "",
            resumeUrl: "",
            jobId: job.id,
          });
          toast({
            title: "Ok, we're preparing to give you a call",
            description: "Get ready, your AI phone screen will begin shortly.",
          });
        } else {
          toast({
            title: "Failed to submit application",
            description: "An error occurred while submitting your application.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("An error occurred while submitting the form:", error);
        toast({
          title: "Error",
          description: "An error occurred while submitting your application.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <>
      <Head>
        <meta name="robots" content="noindex" />
      </Head>
      <div className="bg-white text-gray-900 min-h-screen flex items-center justify-center p-4">
        <Card className="text-gray-900 rounded p-0 md:p-4 shadow-md overflow-hidden max-w-4xl">
          <div className="md:flex md:flex-row flex-col-reverse">
            <CardContent className="p-6 sm:p-2 md:w-1/2">
              <form className="space-y-4">
                <div className="mb-4">
                  <Label htmlFor="name" className="text-gray-900">
                    Full name
                  </Label>
                  <Input
                    type="text"
                    name="name"
                    id="name"
                    value={applicantDetails.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Jane Doe"
                    className="border-gray-300 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                </div>
                <div className="mb-4">
                  <Label htmlFor="email" className="text-gray-900">
                    Email address
                  </Label>
                  <Input
                    type="email"
                    name="email"
                    id="email"
                    value={applicantDetails.email}
                    onChange={handleInputChange}
                    required
                    placeholder="jane.doe@example.com"
                    className="border-gray-300 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                </div>
                <div className="mb-4">
                  <Label htmlFor="phone" className="text-gray-900">
                    Phone number
                  </Label>
                  <div className="border border-gray-300 rounded-md">
                    <PhoneInput
                      international
                      defaultCountry="US"
                      value={applicantDetails.phone}
                      onChange={(value) =>
                        setApplicantDetails({
                          ...applicantDetails,
                          phone: value,
                        })
                      }
                      className="focus:ring-blue-500 focus:border-blue-500 text-gray-900 w-full rounded-md"
                    />
                  </div>
                </div>
                <div className="text-right">
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        disabled={!isFormValid()}
                        className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                          isFormValid()
                            ? "bg-blue-600 hover:bg-blue-700"
                            : "bg-gray-400 cursor-not-allowed"
                        } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                      >
                        Apply for this job
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-white text-gray-900 sm:max-w-md sm:mx-auto sm:w-auto sm:h-auto w-full h-full">
                      <div className="flex flex-col gap-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Prepare for your call
                        </h3>
                        <p className="text-gray-900">
                          This phone screen will be conducted by an AI. Please
                          watch this short video so that you have the best
                          possible experience.
                        </p>
                        <div className="aspect-w-16 aspect-h-9">
                          <video
                            src="/instructions.mp4"
                            controls
                            className="w-full h-full object-cover"
                            onPlay={() => setVideoPlayed(true)}
                          ></video>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            type="button"
                            className="text-gray-900"
                            onClick={() => setIsDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            disabled={!videoPlayed}
                            type="button"
                            onClick={handleSubmit}
                          >
                            Ready for my phone screen
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </form>
            </CardContent>
            <CardContent className="p-6 sm:p-2 md:w-1/2">
              <CardTitle className="text-2xl font-bold text-gray-900 mb-4">
                {job.jobTitle} at {job.company?.name}
              </CardTitle>
              <div className="mb-4">
                <h2 className="font-semibold text-gray-900">Location</h2>
                <CardDescription className="text-gray-900">
                  {job.jobLocation}{" "}
                  {job.remoteFriendly ? "(Remote friendly)" : ""}
                </CardDescription>
              </div>
              <div className="mb-4">
                <h2 className="font-semibold text-gray-900">Job Description</h2>
                <CardDescription className="text-gray-900">
                  {job.jobDescription}
                </CardDescription>
              </div>
              <div className="mb-4">
                <h2 className="font-semibold text-gray-900">Seniority</h2>
                <CardDescription className="text-gray-900 text-sm">
                  {job.seniority}
                </CardDescription>
              </div>
            </CardContent>
          </div>
        </Card>
      </div>
    </>
  );
};

export const getServerSideProps = async (context) => {
  const { job_id } = context.params;

  const job = await prisma.job.findUnique({
    where: { id: parseInt(job_id) },
    select: {
      id: true,
      jobTitle: true,
      jobLocation: true,
      jobDescription: true,
      remoteFriendly: true,
      seniority: true,
      salary: true,
      company: {
        select: {
          name: true,
        },
      },
      requirements: true,
      interviewQuestions: true,
      responsibilities: true,
    },
  });

  if (!job) {
    return {
      notFound: true,
    };
  }

  return {
    props: { job },
  };
};

export default JobPage;
