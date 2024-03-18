// pages/jobs/[job_id].tsx
import { PrismaClient } from "@prisma/client";
import { getSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import Layout from "../../components/Layout";

const prisma = new PrismaClient();

export async function getServerSideProps(context) {
  const session = await getSession(context);

  if (!session || !session.user?.email) {
    return {
      redirect: {
        destination: "/auth/signin",
        permanent: false,
      },
    };
  }
  const { job_id } = context.params;
  const job = await prisma.job.findUnique({
    where: { id: parseInt(job_id) },
    include: {
      candidates: {
        include: {
          phoneScreen: true,
        },
      },
    },
  });

  // Transform data to be serializable and format callLength
  const serializedJob = {
    ...job,
    candidates: job?.candidates.map((candidate) => ({
      ...candidate,
      createdAt: candidate.createdAt.toISOString(),
      updatedAt: candidate.updatedAt.toISOString(),
      phoneScreen: candidate.phoneScreen
        ? {
            ...candidate.phoneScreen,
            callLength: formatCallDuration(candidate.phoneScreen.callLength),
            createdAt: candidate.phoneScreen.createdAt?.toISOString(),
            endAt: candidate.phoneScreen.endAt?.toISOString(),
            updatedAt: candidate.phoneScreen.updatedAt.toISOString(),
          }
        : null,
    })),
  };

  return {
    props: { job: serializedJob },
  };
}

const formatCallDuration = (callLength) => {
  if (typeof callLength === "number") {
    const minutes = Math.floor(callLength);
    const seconds = Math.round((callLength - minutes) * 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }
  return "N/A";
};

export default function JobDetailPage({ job }) {
  console.log(job);
  return (
    <>
      <Head>
        <title>
          {job.jobTitle} - {job.company}
        </title>
      </Head>
      <Layout>
        <div className="container mx-auto mt-10">
          <h1 className="text-4xl font-bold mb-6">
            {job.company} - {job.jobTitle}
          </h1>
          {/* Add a button to archive job */}
          <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded float-right">
            Archive Job
          </button>
          <table className="min-w-full leading-normal">
            <thead>
              <tr className="text-left">
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>LinkedIn</th>
                <th>Duration</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {job.candidates.map((candidate) => (
                <tr key={candidate.id}>
                  <td>
                    <Link
                      href={`/jobs/${job.id}/${candidate.id}`}
                      className="text-indigo-500"
                    >
                      {candidate.name}
                    </Link>
                  </td>
                  <td>{candidate.email}</td>
                  <td>{candidate.phone}</td>
                  <td>
                    {candidate.linkedinUrl ? (
                      <Link href={candidate.linkedinUrl}>
                        <a target="_blank" rel="noopener noreferrer">
                          visit
                        </a>
                      </Link>
                    ) : (
                      "N/A"
                    )}
                  </td>
                  <td>{candidate.phoneScreen?.callLength}</td>
                  <td>
                    {candidate.phoneScreen?.qualificationScore.toFixed(2) ?? 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Layout>
    </>
  );
}
