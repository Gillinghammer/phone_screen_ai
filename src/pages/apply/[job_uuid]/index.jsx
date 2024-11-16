import { useState, useEffect } from "react";
import { useRouter } from "next/router";
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
import { prisma } from '../../../lib/prisma';
import { usePostHog } from "posthog-js/react";

const JobPage = ({ job, subscriptionStatus }) => {
  const router = useRouter();
  const { setTheme } = useTheme();
  const posthog = usePostHog();
  const [applicantDetails, setApplicantDetails] = useState({
    name: "",
    email: "",
    phone: "",
    resumeUrl: "",
    jobId: job.id,
  });
  const [videoPlayed, setVideoPlayed] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [callInitiated, setCallInitiated] = useState(false);

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

        console.log("Submitting application:", applicantDetails);
        console.log("Job details:", job);
        const response = await fetch("/api/apply", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ...applicantDetails, jobId: job.id, job }),
        });

        if (response.ok) {
          setCallInitiated(true);
          posthog.capture("Phone Screen Started", {
            ...applicantDetails,
            jobId: job.id,
            jobTitle: job.jobTitle,
            company: job.company.name,
          });
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
      <div className="bg-[url('/apply-bg.jpg')] bg-cover text-gray-900 min-h-screen flex items-center justify-center p-4">
        <Card className="text-gray-900 rounded-2xl p-0 shadow-2xl overflow-hidden max-w-lg border-0">
          <div className="p-0 md:flex md:flex-row flex-col-reverse">
            <CardContent className="p-0 border-0">
              <div className="p-6">
                {subscriptionStatus ? (
                  <>
                    <CardTitle className="text-gray-900 text-lg font-normal pb-4">
                      Complete the form to begin the phone screen for
                      <br />
                      <span className="font-bold">{job.jobTitle}</span>
                    </CardTitle>
                    <form className="space-y-4">
                      <div className="mb-4">
                        <Label htmlFor="name" className="text-gray-900 text-lg">
                          Full Name
                        </Label>
                        <Input
                          type="text"
                          name="name"
                          id="name"
                          value={applicantDetails.name}
                          onChange={handleInputChange}
                          required
                          placeholder="Jack Smith"
                          className="text-lg py-4 border-gray-300 focus:ring-green-500 focus:border-green-500 text-gray-900"
                        />
                      </div>
                      <div className="mb-4">
                        <Label
                          htmlFor="email"
                          className="text-gray-900 text-lg"
                        >
                          Email Address
                        </Label>
                        <Input
                          type="email"
                          name="email"
                          id="email"
                          value={applicantDetails.email}
                          onChange={handleInputChange}
                          required
                          placeholder="jack.smith@gmail.com"
                          className="text-lg py-4 border-gray-300 focus:ring-green-500 focus:border-green-500 text-gray-900"
                        />
                      </div>
                      <div className="mb-4">
                        <Label
                          htmlFor="phone"
                          className="text-gray-900 text-lg"
                        >
                          Phone Number
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
                            className="text-gray-900 w-full rounded-md custom-phone-input"
                          />
                        </div>
                      </div>
                      <div className="text-right">
                        <Dialog
                          open={isDialogOpen}
                          onOpenChange={setIsDialogOpen}
                        >
                          <DialogTrigger asChild>
                            <Button
                              disabled={!isFormValid()}
                              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                                isFormValid()
                                  ? "bg-gray-600 hover:bg-gray-700"
                                  : "bg-gray-400 cursor-not-allowed"
                              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500`}
                            >
                              Begin phone screen
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-white text-gray-900 sm:max-w-md sm:mx-auto sm:w-auto sm:h-auto w-full h-full">
                            <div className="flex flex-col gap-4">
                              <h3 className="text-lg font-semibold text-gray-900">
                                Prepare for your call
                              </h3>
                              <p className="text-gray-900">
                                This phone screen will be conducted by an AI.
                                Please watch this short video so that you have
                                the best possible experience.
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
                                  disabled={!videoPlayed || callInitiated}
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
                  </>
                ) : (
                  <div className="text-center">
                    <p className="text-lg mb-4">
                      Please finish setting up your subscription to begin
                      screening candidates.
                    </p>
                    <Button
                      onClick={() => {
                        router.push("/payment-method");
                      }}
                    >
                      Add Payment Method
                    </Button>
                  </div>
                )}
              </div>
              <div className="p-6 bg-gray-900 text-white italic text-sm">
                AI candidate screening technology is powered by{" "}
                <a
                  target="_blank"
                  href="https://phonescreen.ai/"
                  className="font-bold"
                >
                  PhoneScreen.AI
                </a>
              </div>
            </CardContent>
          </div>
        </Card>
      </div>
    </>
  );
};

export const getServerSideProps = async (context) => {
  const { job_uuid } = context.params;

  const job = await prisma.job.findFirst({
    where: { uuid: job_uuid },
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
          id: true,
          name: true,
          parentCompanyId: true,
        },
      },
      requirements: true,
      interviewQuestions: true,
      responsibilities: true,
    },
  });

  if (!job) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const company = await prisma.company.findUniqueOrThrow({
    where: { id: job.company.id },
    select: {
      name: true,
      stripeSubscriptionIds: true,
      stripeCustomerId: true,
      parentCompanyId: true,
    },
  });

  let billingCompany = company;
  if (company.parentCompanyId) {
    const parentCompany = await prisma.company.findUnique({
      where: { id: company.parentCompanyId },
      select: {
        stripeSubscriptionIds: true,
        stripeCustomerId: true,
      },
    });
    if (parentCompany) {
      billingCompany = parentCompany;
    }
  }

  const activeSubscription =
    !!billingCompany.stripeCustomerId && !!billingCompany.stripeSubscriptionIds.length;

  return {
    props: { job, subscriptionStatus: activeSubscription },
  };
};

export default JobPage;
