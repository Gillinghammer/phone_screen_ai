// pages/jobs/[job_id]/[candidate_id].tsx
import { useState } from "react";
import { PrismaClient } from "@prisma/client";
import { getSession } from "next-auth/react";
import Layout from "../../../components/Layout";
import Head from "next/head";
import { formatDistanceToNow } from "date-fns";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useRouter } from "next/router";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";

const prisma = new PrismaClient();

export async function getServerSideProps(context) {
  const { job_id, candidate_id } = context.params;

  const phoneScreen = await prisma.phoneScreen.findUnique({
    where: { candidateId: parseInt(candidate_id) },
    include: { candidate: true, job: true },
  });

  const job = await prisma.job.findUnique({
    where: { id: parseInt(job_id, 10) },
    include: { company: true },
  });

  if (!phoneScreen) {
    // Handle the case where there is no phone screen found
    return {
      notFound: true,
    };
  }

  return {
    props: {
      phoneScreen: JSON.parse(JSON.stringify(phoneScreen)),
      job: JSON.parse(JSON.stringify(job)),
    },
  };
}

async function updateCandidateStatus(candidateId, newStatus, refreshData) {
  try {
    const response = await fetch(`/api/candidates/${candidateId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: newStatus }),
    });

    if (!response.ok) {
      throw new Error("Failed to update candidate status");
    }

    const updatedCandidate = await response.json();
    console.log("Candidate updated:", updatedCandidate);
    refreshData();
  } catch (error) {
    console.error("Error updating candidate status:", error);
  }
}

export default function CandidateDetailPage({ phoneScreen, job }) {
  console.log("Phone Screen:", phoneScreen);
  const { toast } = useToast();
  const [isReScoring, setIsReScoring] = useState(false);

  const router = useRouter();

  const refreshData = () => {
    router.replace(router.asPath);
  };
  // Deserialize analysis JSON
  const { questions, answers } = phoneScreen.analysis || {
    questions: [],
    answers: [],
  };

  async function handleReScore() {
    setIsReScoring(true);
    toast({
      title: "Recalculating score",
      description: "This will take a few moments to update",
    });
    try {
      const response = await fetch(`/api/analyze-call`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          callId: phoneScreen.callId,
          jobId: phoneScreen.jobId,
          phoneScreenId: phoneScreen.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to re-score phone screen");
      }

      const updatedPhoneScreen = await response.json();
      console.log("Phone screen re-scored:", updatedPhoneScreen);
      refreshData();
    } catch (error) {
      console.error("Error re-scoring phone screen:", error);
    }
    setIsReScoring(false);
  }

  return (
    <>
      <Head>
        <title>Candidate Detail - {phoneScreen.candidate.name}</title>
      </Head>
      <Layout>
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/jobs">Jobs</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/jobs/${phoneScreen.job.id}`}>
                {phoneScreen.job.jobTitle}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{phoneScreen.candidate.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="container mx-auto my-10">
          <Card className="p-6">
            <div className="lg:flex lg:justify-between lg:items-center mb-6">
              <div className="mb-6 lg:mb-0">
                <div className="mb-4 flex justify-between items-center">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold">
                      {phoneScreen.job.jobTitle}
                    </h1>
                    <p className="text-lg">{job.company.name}</p>
                  </div>
                </div>
                <div className="rounded-lg py-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">
                      {phoneScreen.candidate.name}
                    </h2>
                    <Badge
                      variant={
                        phoneScreen.candidate.status === "REJECTED"
                          ? "destructive"
                          : phoneScreen.candidate.status === "OPEN" ||
                            phoneScreen.candidate.status === "ARCHIVED"
                          ? "outline"
                          : "default"
                      }
                    >
                      {phoneScreen.candidate.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="">Email</p>
                      <p className="">{phoneScreen.candidate.email}</p>
                    </div>
                    <div>
                      <p className="">Phone</p>
                      <p className="">{phoneScreen.candidate.phone}</p>
                    </div>
                    <div>
                      <p className="">Applied</p>
                      <p className="">
                        {formatDistanceToNow(new Date(phoneScreen.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <Button
                  onClick={handleReScore}
                  variant="ghost"
                  disabled={isReScoring}
                >
                  {isReScoring ? "Recalculating..." : "Recalculate Score"}
                </Button>
                <div className="text-4xl md:text-6xl font-bold">
                  {phoneScreen.qualificationScore.toFixed(2) ?? 0}
                </div>
                <div className="text-lg md:text-xl">score</div>
                <div className="mt-4 flex flex-col sm:flex-row sm:justify-center">
                  <Button
                    onClick={() =>
                      updateCandidateStatus(
                        phoneScreen.candidateId,
                        "ACCEPTED",
                        refreshData
                      )
                    }
                    variant=""
                    className="mb-2 sm:mb-0 sm:mr-2"
                  >
                    Accept
                  </Button>
                  <Button
                    onClick={() =>
                      updateCandidateStatus(
                        phoneScreen.candidateId,
                        "REJECTED",
                        refreshData
                      )
                    }
                    variant="destructive"
                    className="mb-2 sm:mb-0 sm:mr-2"
                  >
                    Reject
                  </Button>
                  <Button
                    onClick={() =>
                      updateCandidateStatus(
                        phoneScreen.candidateId,
                        "ARCHIVED",
                        refreshData
                      )
                    }
                    variant="outline"
                  >
                    Archive
                  </Button>
                </div>
              </div>
            </div>
            {phoneScreen.recordingUrl && (
              <Card className="mb-6 p-4 shadow">
                <h3 className="text-xl font-bold mb-4">
                  Listen to Phone Screen
                </h3>
                <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
                  <audio
                    controls
                    src={phoneScreen.recordingUrl}
                    className="w-full mb-2 md:mb-0"
                  >
                    Your browser does not support the audio element.
                  </audio>
                  <div>
                    <p className="text-sm text-gray-500">Call Duration:</p>
                    <p className="text-lg">
                      {formatCallDuration(phoneScreen.callLength)}
                    </p>
                  </div>
                </div>
              </Card>
            )}
            <div className="">
              {questions.map((question, index) => (
                <div key={index} className="mb-6">
                  <div className="flex flex-col md:flex-row md:items-center">
                    <Accordion
                      type="single"
                      collapsible
                      className="flex-1 mb-4 md:mb-0 md:mr-4"
                    >
                      <AccordionItem value={`item-${index}`}>
                        <AccordionTrigger className="text-left">
                          <div className="flex flex-col items-start">
                            <div className="text-sm mb-1">
                              Question {index + 1}
                            </div>
                            <p className="text-base md:text-lg mb-1">
                              {question[0]}
                            </p>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <Card className="bg-gray-50 p-4 my-2">
                            <p className="text-base md:text-lg">
                              {answers[index]?.answer || "N/A"}
                            </p>
                          </Card>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                    <div className="self-center md:ml-4">
                      <div className="rounded-full w-16 h-16 flex flex-col items-center justify-center">
                        <span className="text-2xl md:text-3xl font-bold">
                          {answers[index]?.score || 0}
                        </span>
                        <span className="text-xs text-gray-500">score</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </Layout>
    </>
  );
}

function formatCallDuration(callLength) {
  // Convert callLength from minutes to a human-readable format
  if (typeof callLength === "number") {
    const minutes = Math.floor(callLength);
    const seconds = Math.round((callLength - minutes) * 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }
  return "N/A";
}
