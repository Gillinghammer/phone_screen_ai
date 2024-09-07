import { PrismaClient } from "@prisma/client";
import Head from "next/head";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import { usePostHog } from "posthog-js/react";
import { useEffect } from "react";

import Layout from "../../components/Layout";
import JobTable from "../../components/JobTable";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage } from "@/components/ui/breadcrumb"; // Update this import
import { withActiveSubscription } from '../../components/withActiveSubscription';
import { getUserAndCompany, getJobs } from '../../lib/dataFetchers';

const prisma = new PrismaClient();

// Add this function
async function getSessionData(context) {
  const session = await getSession(context);
  return session;
}

export async function getServerSideProps(context) {
  const session = await getSessionData(context);

  if (!session || !session.user?.email) {
    return { redirect: { destination: "/auth/signin", permanent: false } };
  }

  const { user, company } = await getUserAndCompany(session.user.email);
  const jobs = await getJobs(user.companyId);

  return { props: { user, company, jobs } };
}

// Add this hook definition
function usePostHogTracking(posthog, user, company) {
  useEffect(() => {
    if (posthog && user && company) {
      posthog.identify(user.id, {
        email: user.email,
        company: company.name,
      });
    }
  }, [posthog, user, company]);
}

function JobsBreadcrumb() {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbPage>Jobs</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}

function JobsHeader() {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">Active Job Screens</h1>
    </div>
  );
}

function JobsPage({ user, company, jobs }) {
  const router = useRouter();
  const posthog = usePostHog();

  usePostHogTracking(posthog, user, company);

  const refreshData = () => router.replace(router.asPath);

  return (
    <>
      <Head>
        <title>Active Job Screens</title>
      </Head>
      <Layout>
        <div className="container mx-auto mt-10">
          <JobsBreadcrumb />
          <JobsHeader />
          <div className="overflow-x-auto">
            <JobTable
              jobs={jobs}
              refetchJobs={refreshData}
              companyId={user.companyId}
            />
          </div>
        </div>
      </Layout>
    </>
  );
}

export default withActiveSubscription(JobsPage);