// pages/jobs/index.js
import { PrismaClient } from "@prisma/client";
import Head from "next/head";
import React from "react";
import Layout from "../../components/Layout";
import { getSession } from "next-auth/react";
import JobTable from "../../components/JobTable";
import { format } from "date-fns";
import { useRouter } from "next/router";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const prisma = new PrismaClient();

export async function getServerSideProps(context) {
  const session = await getSession(context);
  console.log("debug session", session);
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
    where: {
      companyId: user.companyId,
      // userId, removed as it would prvent you from seeing jobs created by coworkers
      isArchived: false,
    },
    select: {
      id: true,
      uuid: true,
      jobLocation: true,
      company: {
        select: {
          name: true,
        },
      },
      jobTitle: true,
      createdAt: true,
      updatedAt: true,
      candidates: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          status: true,
          phoneScreen: {
            select: {
              id: true,
              callLength: true,
              qualificationScore: true,
            },
          },
        },
      },
    },
  });

  // Convert DateTime fields to strings
  jobs = jobs.map((job) => ({
    ...job,
    createdAt: format(job.createdAt, "yyyy-MM-dd HH:mm:ss"),
    updatedAt: format(job.updatedAt, "yyyy-MM-dd HH:mm:ss"),
    candidates: job.candidates.map((candidate) => ({
      ...candidate,
      phoneScreen: candidate.phoneScreen
        ? {
            ...candidate.phoneScreen,
          }
        : null,
    })),
  }));

  console.log("debug jobs", jobs);

  return {
    props: {
      jobs,
      companyId: user.companyId,
    },
  };
}

export default function JobsPage({ jobs, companyId }) {
  const router = useRouter();

  const refreshData = () => {
    router.replace(router.asPath);
  };

  console.log("debug jobs", jobs);

  return (
    <>
      <Head>
        <title>Active Job Screens</title>
      </Head>
      <Layout>
        <div className="container mx-auto mt-10">
          <Breadcrumb className="mb-4">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/jobs">Jobs</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-4xl font-bold">Active Job Screens</h1>
          </div>
          <div className="overflow-x-auto">
            <JobTable
              jobs={jobs}
              refetchJobs={refreshData}
              companyId={companyId}
            />
          </div>
        </div>
      </Layout>
    </>
  );
}
