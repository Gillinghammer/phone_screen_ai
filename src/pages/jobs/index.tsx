// pages/jobs/index.js
import { PrismaClient } from "@prisma/client";
import Head from "next/head";
import React from "react";
import { getSession } from "next-auth/react";

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

  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
  });

  const userId = user.id;

  let jobs = await prisma.job.findMany({
    where: { userId },
    include: {
      candidates: {
        include: {
          phoneScreen: true,
        },
      },
    },
  });

  // Convert DateTime fields to strings
  jobs = jobs.map((job) => ({
    ...job,
    candidates: job.candidates.map((candidate) => ({
      ...candidate,
      createdAt: candidate.createdAt.toISOString(),
      updatedAt: candidate.updatedAt.toISOString(),
      phoneScreen: candidate.phoneScreen
        ? {
            ...candidate.phoneScreen,
            createdAt: candidate.phoneScreen.createdAt?.toISOString(),
            updatedAt: candidate.phoneScreen.updatedAt.toISOString(),
            endAt: candidate.phoneScreen.endAt?.toISOString(),
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
      <div className="container mx-auto mt-10">
        <h1 className="text-4xl font-bold mb-6">Active Job Screens</h1>
        <div className="overflow-x-auto">
          <table className="table-auto w-full">
            <thead className="text-xs font-semibold uppercase text-gray-400 bg-gray-50">
              <tr>
                <th className="p-2 whitespace-nowrap">
                  <div className="font-semibold text-left">Company</div>
                </th>
                <th className="p-2 whitespace-nowrap">
                  <div className="font-semibold text-left">Job Title</div>
                </th>
                <th className="p-2 whitespace-nowrap">
                  <div className="font-semibold text-center">Candidates</div>
                </th>
                <th className="p-2 whitespace-nowrap">
                  <div className="font-semibold text-center">Avg Score</div>
                </th>
                <th className="p-2 whitespace-nowrap">
                  <div className="font-semibold text-center">Actions</div>
                </th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100">
              {jobs.map((job) => {
                const avgScore =
                  job.candidates.reduce((acc, candidate) => {
                    return (
                      acc + (candidate.phoneScreen?.qualificationScore || 0)
                    );
                  }, 0) / job.candidates.length;

                return (
                  <tr key={job.id}>
                    <td className="p-2 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="font-medium text-gray-800">
                          {job.company}
                        </div>
                      </div>
                    </td>
                    <td className="p-2 whitespace-nowrap">
                      <div className="text-left">{job.jobTitle}</div>
                    </td>
                    <td className="p-2 whitespace-nowrap">
                      <div className="text-center">{job.candidates.length}</div>
                    </td>
                    <td className="p-2 whitespace-nowrap">
                      <div className="text-center">{avgScore.toFixed(2)}</div>
                    </td>
                    <td className="p-2 whitespace-nowrap">
                      <div className="text-lg text-center">
                        <a
                          href="#"
                          className="text-blue-500 hover:text-blue-600"
                        >
                          view
                        </a>{" "}
                        <a
                          href="#"
                          className="text-blue-500 hover:text-blue-600"
                        >
                          archive
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
