import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { getSession } from "next-auth/react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Pagination } from '@/components/Pagination';

import Layout from "@/components/Layout";
import CandidateTable from '../../components/CandidateTable';
import JobPageHeader from "@/components/JobPageHeader";
import JobEditDrawer from "@/components/JobEditDrawer";
import { JobPageBreadcrumb } from "@/components/JobPageBreadcrumb";

import { getFilteredCandidates, performBulkAction } from "@/lib/utils";
import { fetchJob, getPaginatedCandidates } from "@/lib/dataFetchers";

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

  const candidates = await getPaginatedCandidates(job.id);

  return { 
    props: { 
      job,
      candidates,
    } 
  };
}

function JobDetailPage({ job, candidates }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [hideArchived, setHideArchived] = useState(true);
  const [hideDroppedMissed, setHideDroppedMissed] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const { toast } = useToast();
  const router = useRouter();

  const filteredCandidates = useMemo(() => {
    return candidates.filter(candidate => {
      const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            candidate.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesArchived = hideArchived ? candidate.status !== 'ARCHIVED' : true;
      
      // Refined check for Dropped/Missed/Voicemail/Invalid Score
      const hasPhoneScreen = candidate.phoneScreen;
      const isVoicemail = !hasPhoneScreen;
      const isScoreZero = hasPhoneScreen && candidate.phoneScreen.qualificationScore === 0;
      const isScoreNotNumber = hasPhoneScreen && typeof candidate.phoneScreen.qualificationScore !== 'number';
      const isDroppedOrMissed = isVoicemail || isScoreZero || isScoreNotNumber;

      const matchesDroppedMissed = hideDroppedMissed ? !isDroppedOrMissed : true;
      
      return matchesSearch && matchesArchived && matchesDroppedMissed;
    });
  }, [candidates, searchTerm, hideArchived, hideDroppedMissed]);

  const totalPages = Math.ceil(filteredCandidates.length / RECORDS_PER_PAGE);

  const paginatedCandidates = useMemo(() => {
    const startIndex = (currentPage - 1) * RECORDS_PER_PAGE;
    return filteredCandidates.slice(startIndex, startIndex + RECORDS_PER_PAGE);
  }, [filteredCandidates, currentPage]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleSearchTermChange = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const handleHideArchivedChange = (checked) => {
    setHideArchived(checked);
    setCurrentPage(1);
  };

  const handleHideDroppedMissedChange = (checked) => {
    setHideDroppedMissed(checked);
    setCurrentPage(1);
  };

  const handleBulkAction = async (action, candidateIds) => {
    try {
      setLoading(true);
      await performBulkAction(job, action, candidateIds);
      toast({
        title: "Bulk action completed",
        description: `Successfully ${action.toLowerCase()}ed ${candidateIds.length} candidates`,
      });
      router.replace(router.asPath);
    } catch (error) {
      console.error('Error performing bulk action:', error);
      toast({
        title: "Error",
        description: "Failed to perform bulk action",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
      <div className="bg-white shadow-sm rounded-lg">
        {(!paginatedCandidates || paginatedCandidates.length === 0) ? (
          <div className="flex justify-center items-center p-8 sm:p-12">
            <Card className="w-full max-w-md">
              <CardContent className="pt-6">
                {emptyStateCard}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="p-4 sm:p-6">
            <div className="mb-4 flex justify-between items-center">
              <Input
                type="text"
                placeholder="Search candidates..."
                value={searchTerm}
                onChange={handleSearchTermChange}
                className="max-w-sm"
              />
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <Checkbox 
                    id="hideArchived" 
                    checked={hideArchived} 
                    onCheckedChange={handleHideArchivedChange}
                  />
                  <label htmlFor="hideArchived" className="ml-2 text-sm text-gray-700">
                    Hide Archived
                  </label>
                </div>
                <div className="flex items-center">
                  <Checkbox 
                    id="hideDroppedMissed" 
                    checked={hideDroppedMissed} 
                    onCheckedChange={handleHideDroppedMissedChange}
                  />
                  <label htmlFor="hideDroppedMissed" className="ml-2 text-sm text-gray-700">
                    Hide Dropped/Missed
                  </label>
                </div>
              </div>
            </div>
            <CandidateTable
              candidates={paginatedCandidates}
              jobId={job.id}
              onBulkAction={handleBulkAction}
            />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              loading={loading}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <Layout>
      <Head>
        <title>{job.jobTitle} | Job Details</title>
      </Head>
      <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <JobPageBreadcrumb jobTitle={job.jobTitle} />
        <div className="bg-white shadow-sm rounded-lg mt-4">
          <div className="p-4 sm:p-6">
            <JobPageHeader 
              job={job}
              onEditJobClick={() => setIsDrawerOpen(true)}
            />
          </div>
          {renderContent()}
        </div>
      </div>
      <JobEditDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        job={job}
        refreshData={() => router.replace(router.asPath)}
      />
    </Layout>
  );
}

export default JobDetailPage;
