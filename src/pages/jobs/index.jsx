// pages/jobs/index.js
import { PrismaClient } from "@prisma/client";
import Head from "next/head";
import React from "react";
import Layout from "../../components/Layout";
import { getSession } from "next-auth/react";
import Link from "next/link";

const prisma = new PrismaClient();

export async function getServerSideProps(context) {
  const session = await getSession(context);
  console.log("debug session", session)
  // if (!session || !session.user?.email) {
  //   return {
  //     redirect: {
  //       destination: "/auth/signin",
  //       permanent: false,
  //     },
  //   };
  // }

  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
  });

  const userId = user.id;

  let jobs = await prisma.job.findMany({
    where: { userId },
    select: {
      id: true,  // Include the id field from jobs
      company: true,  // Include the company field from jobs
      jobTitle: true,  // Include the jobTitle field from jobs
      candidates: {
        select: {
          id: true,  // Include the id field from candidates
          name: true,  // Include the name field from candidates
          email: true,  // Include the email field from candidates
          phone: true,  // Include the phone field from candidates
          status: true,  // Include the status field from candidates
          phoneScreen: {
            select: {
              id: true,  // Include the id field from phoneScreen
              callLength: true,  // Include the callLength field from phoneScreen
              qualificationScore: true,  // Include the qualificationScore field from phoneScreen
            },
          },
        },
      },
    },
  });
  
  

  // Convert DateTime fields to strings
  jobs = jobs.map((job) => ({
    ...job,
    candidates: job.candidates.map((candidate) => ({
      ...candidate,
      phoneScreen: candidate.phoneScreen
        ? {
            ...candidate.phoneScreen,
          }
        : null,
    })),
  }));
  

  return {
    props: {
      jobs,
    },
  };
}

export default function JobsPage({ jobs }) {
  return (
    <>
      <Head>
        <title>Active Job Screens</title>
      </Head>
      <Layout>
        <div className="container mx-auto mt-10">
          <h1 className="text-4xl font-bold mb-6">Active Job Screens</h1>
          <div className="overflow-x-auto">
            <Link
              href={`/add`}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded float-right"
            >
              Add Job
            </Link>{" "}
            <table className="table-auto w-full">
              <thead className="text-xs font-semibold uppercase text-gray-400 bg-gray-50">
                <tr className="text-left">
                  <th className="p-2 whitespace-nowrap">
                    <div className="font-semibold text-left">Company</div>
                  </th>
                  <th className="p-2 whitespace-nowrap">
                    <div className="font-semibold text-left">Job Title</div>
                  </th>
                  <th className="p-2 whitespace-nowrap">
                    <div className="font-semibold text-left">
                      Job Screening URL
                    </div>
                  </th>
                  <th className="p-2 whitespace-nowrap">
                    <div className="font-semibold text-center">Candidates</div>
                  </th>
                  <th className="p-2 whitespace-nowrap">
                    <div className="font-semibold text-center">Avg Score</div>
                  </th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-100">
                {jobs.map((job) => {
                  const totalScore = job.candidates.reduce((acc, candidate) => {
                    return (
                      acc +
                      Number(candidate.phoneScreen?.qualificationScore || 0)
                    );
                  }, 0);

                  const avgScore =
                    job.candidates.length > 0
                      ? totalScore / job.candidates.length
                      : NaN;

                  const displayAvgScore = isNaN(avgScore)
                    ? "-"
                    : avgScore.toFixed(2);
                  return (
                    <>
                      <tr key={job.id}>
                        <td className="p-2 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="font-medium text-gray-800">
                              {job.company}
                            </div>
                          </div>
                        </td>
                        <td className="p-2 whitespace-nowrap">
                          <div className="text-left">
                            <Link
                              href={`/jobs/${job.id}`}
                              className="text-blue-500 hover:text-blue-600"
                            >
                              {job.jobTitle}
                            </Link>
                          </div>
                        </td>
                        <td className="p-2 whitespace-nowrap">
                          <div className="text-left">
                            <Link
                              href={`/apply/${job.id}`}
                              className="text-blue-500 hover:text-blue-600"
                            >
                              Apply here
                            </Link>
                          </div>
                        </td>
                        <td className="p-2 whitespace-nowrap">
                          <div className="text-center">
                            {job.candidates.length}
                          </div>
                        </td>
                        <td className="p-2 whitespace-nowrap">
                          <div className="text-center">{displayAvgScore}</div>
                        </td>
                      </tr>
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </Layout>
    </>
  );
}
