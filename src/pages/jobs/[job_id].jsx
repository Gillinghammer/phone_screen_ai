import { useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { getSession } from "next-auth/react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Input } from "@/components/ui/input";

import Layout from "@/components/Layout";
import CandidateTable from '../../components/CandidateTable';
import JobPageHeader from "@/components/JobPageHeader";
import JobEditDrawer from "@/components/JobEditDrawer";
import { JobPageBreadcrumb } from "@/components/JobPageBreadcrumb";

import { getFilteredCandidates } from "@/lib/utils";
import { fetchJob } from "@/lib/dataFetchers";

const RECORDS_PER_PAGE = 20;

export async function getServerSideProps(context) {
  const session = await getSession(context);
  if (!session || !session.user?.email) {
    return { redirect: { destination: "/auth/signin", permanent: false } };
  }

  const { job_id } = context.params;
  const job = await fetchJob(job_id, session.user.email);

  if (!job) {
    return { notFound: true };
  }

  return { props: { job } };
}

function JobDetailPage({ job }) {
  console.log('Rendering JobDetailPage, job:', job);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState("screened");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedStatus, setSelectedStatus] = useState("any");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  const { toast } = useToast();
  const router = useRouter();

  const refreshData = () => router.replace(router.asPath);

  const filteredCandidates = job.candidates ? getFilteredCandidates(
    job.candidates,
    searchTerm,
    selectedStatus,
    sortColumn,
    sortOrder
  ) : [];

  const totalPages = Math.ceil(filteredCandidates.length / RECORDS_PER_PAGE);
  const paginatedCandidates = filteredCandidates.slice(
    (currentPage - 1) * RECORDS_PER_PAGE,
    currentPage * RECORDS_PER_PAGE
  );

  const handleSearchTermChange = (event) => setSearchTerm(event.target.value);
  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortOrder("asc");
    }
  };
  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);
  const handleStatusChange = (status) => setSelectedStatus(status);

  const renderContent = () => {
    const emptyStateCard = (
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">No candidates yet</h3>
        <p className="text-gray-500 mb-6">Share the screening link to start receiving candidates</p>
        <div className="space-y-3">
          <Link href={`/apply/${job.uuid}`} target="_blank" rel="noopener noreferrer">
            <Button className="w-full bg-gray-100 text-gray-900 hover:bg-gray-200">
              Share screening link
            </Button>
          </Link>
          <Button variant="outline" className="w-full" onClick={() => setIsDrawerOpen(true)}>
            Edit Job Details and Questions
          </Button>
        </div>
      </div>
    );

    return (
      <div className="bg-white shadow-sm border rounded-lg">
        <div className="p-4 sm:p-6 border-b">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Input
                type="text"
                placeholder="Search candidates..."
                value={searchTerm}
                onChange={handleSearchTermChange}
                className="max-w-xs"
              />
              {/* Add filter dropdown here if needed */}
            </div>
            <Button variant="outline" onClick={() => setIsDrawerOpen(true)} className="bg-gray-100 text-gray-900 hover:bg-gray-200">
              Edit Job
            </Button>
          </div>
        </div>

        {(!job.candidates || job.candidates.length === 0) ? (
          <div className="flex justify-center items-center p-8 sm:p-12">
            <Card className="w-full max-w-md">
              <CardContent className="pt-6">
                {emptyStateCard}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="p-4 sm:p-6">
            <CandidateTable
              candidates={paginatedCandidates}
              jobId={job.id}
            />
            {/* Add pagination controls here */}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <Head>
        <title>{job.jobTitle} | Job Details</title>
      </Head>
      {/* Comment out the Layout component temporarily */}
      {/* <Layout> */}
        <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <JobPageBreadcrumb jobTitle={job.jobTitle} />
          <div className="bg-white shadow-sm border rounded-lg mt-4">
            <div className="p-4 sm:p-6 border-b">
              <JobPageHeader 
                job={job}
              />
            </div>
            {renderContent()}
          </div>
        </div>
      {/* </Layout> */}
      <JobEditDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        job={job}
        refreshData={refreshData}
      />
    </>
  );
}

export default JobDetailPage;
