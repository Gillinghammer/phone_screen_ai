// pages/jobs/[job_id]/[candidate_id].tsx
import { PrismaClient } from "@prisma/client";
import { getSession } from "next-auth/react";
import Layout from "../../../components/Layout";
import Head from "next/head";
import Link from "next/link";

const prisma = new PrismaClient();

export async function getServerSideProps(context) {
  const { job_id, candidate_id } = context.params;

  const phoneScreen = await prisma.phoneScreen.findUnique({
    where: { candidateId: parseInt(candidate_id) },
    include: { candidate: true, job: true },
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
    },
  };
}

async function updateCandidateStatus(candidateId, newStatus) {
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
  } catch (error) {
    console.error("Error updating candidate status:", error);
  }
}

export default function CandidateDetailPage({ phoneScreen }) {
  // Deserialize analysis JSON
  const { questions, answers } = phoneScreen.analysis || {
    questions: [],
    answers: [],
  };

  // Split answers into chunks of 2 (answer text and score)
  const answerChunks = [];
  for (let i = 0; i < answers.length; i += 2) {
    answerChunks.push({ text: answers[i], score: answers[i + 1] });
  }

  return (
    <>
      <Head>
        <title>Candidate Detail - {phoneScreen.candidate.name}</title>
      </Head>
      <Layout>
        <div className="container mx-auto my-10 p-6 border rounded shadow">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold">
                {phoneScreen.job.company} - {phoneScreen.job.jobTitle}
              </h1>
              <h2 className="text-2xl">{phoneScreen.candidate.name}</h2>
              <p>Email: {phoneScreen.candidate.email}</p>
              <p>Phone: {phoneScreen.candidate.phone}</p>
              <p>
                LinkedIn:{" "}
                {phoneScreen.candidate.linkedinUrl ? (
                  <Link href={phoneScreen.candidate.linkedinUrl}>Profile</Link>
                ) : (
                  "N/A"
                )}
              </p>
            </div>
            <div className="text-center">
              <div className="text-6xl font-bold">
                {phoneScreen.qualificationScore.toFixed(2) ?? 0}
              </div>
              <div className="text-xl">score</div>
            </div>
          </div>
          {phoneScreen.recordingUrl && (
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-2">Listen to Phone Screen</h3>
              <audio controls src={phoneScreen.recordingUrl}>
                Your browser does not support the audio element.
              </audio>
              <p>Call Duration: {formatCallDuration(phoneScreen.callLength)}</p>
            </div>
          )}
          <div className="mb-6">
            <button
              onClick={() =>
                updateCandidateStatus(phoneScreen.candidateId, "ACCEPTED")
              }
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2"
            >
              Accept
            </button>
            <button
              onClick={() =>
                updateCandidateStatus(phoneScreen.candidateId, "REJECTED")
              }
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mr-2"
            >
              Reject
            </button>
            <button
              onClick={() =>
                updateCandidateStatus(phoneScreen.candidateId, "ARCHIVED")
              }
              className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
            >
              Archive
            </button>
          </div>
          <div className="mb-6">
            <h3 className="text-xl font-bold">Listen to Phone Screen</h3>
            <p>Call Duration: {formatCallDuration(phoneScreen.callLength)}</p>
            {/* Assume there's an audio player component */}
          </div>
          <div>
            {questions.map((question, index) => (
              <div key={index} className="mb-6">
                <h4 className="text-lg font-bold">Question {index + 1}</h4>
                <p className="text-lg">{question[0]}</p>
                <div className="bg-blue-100 p-4 my-2">
                  <p className="text-lg">
                    {answerChunks[index]?.text || "No answer provided"}
                  </p>
                  <p className="text-lg">
                    Score: {answerChunks[index]?.score || "N/A"}
                  </p>
                </div>
              </div>
            ))}
          </div>
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
