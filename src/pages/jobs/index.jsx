import { prisma } from '../../lib/prisma';
import Head from "next/head";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import { usePostHog } from "posthog-js/react";
import { useEffect, useState, useMemo } from "react";

import Layout from "../../components/Layout";
import JobTable from "../../components/JobTable";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { withActiveSubscription } from '../../components/withActiveSubscription';
import { getUserAndCompany, getJobs } from '../../lib/dataFetchers';
import { Button } from "@/components/ui/button";
import { Pagination } from '@/components/Pagination';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import AddJobSheet from "@/components/AddJobSheet";

const ITEMS_PER_PAGE = 10;

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

  return { 
    props: { 
      user, 
      company, 
      jobs,
    } 
  };
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

function JobsPage({ user, company, jobs }) {
  const router = useRouter();
  const posthog = usePostHog();
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isAddJobSheetOpen, setIsAddJobSheetOpen] = useState(false);

  usePostHogTracking(posthog, user, company);

  const totalPages = Math.ceil(jobs.length / ITEMS_PER_PAGE);

  const paginatedJobs = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return jobs.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [jobs, currentPage]);

  const refreshData = () => router.replace(router.asPath);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  return (
    <Layout>
      <Head>
        <title>Active Job Screens</title>
      </Head>
      <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-sm rounded-lg mt-4">
          <div className="p-4 sm:p-6">
            {jobs.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">No jobs yet</h3>
                    <p className="text-gray-500 mb-6">List your first job to get started</p>
                    <Button 
                      className="w-full bg-gray-100 text-gray-900 hover:bg-gray-200"
                      onClick={() => setIsAddJobSheetOpen(true)}
                    >
                      Add New Job
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <JobTable
                    jobs={paginatedJobs}
                    refetchJobs={refreshData}
                    companyId={user.companyId}
                  />
                </div>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  loading={loading}
                />
              </>
            )}
          </div>
        </div>
      </div>
      <AddJobSheet
        isOpen={isAddJobSheetOpen}
        onClose={() => setIsAddJobSheetOpen(false)}
        companyId={user.companyId}
        onJobAdded={refreshData}
      />
    </Layout>
  );
}

export default withActiveSubscription(JobsPage);