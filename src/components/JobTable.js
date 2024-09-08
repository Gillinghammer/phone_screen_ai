import { useState } from "react";
import AddJobSheet from "./AddJobSheet";
import Link from 'next/link';
import { formatDistanceToNow, parseISO } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import JobPostParser from "./JobPostParser";
import { useToast } from "@/components/ui/use-toast";
import { ExternalLinkIcon, PlusCircledIcon } from "@radix-ui/react-icons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const RECORDS_PER_PAGE = 20;

const JobTable = ({ jobs, refetchJobs, companyId }) => {
  const [selectedJobs, setSelectedJobs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddJobSheetOpen, setIsAddJobSheetOpen] = useState(false);
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false);

  const { toast } = useToast();

  const handleSelectAllJobs = (checked) => {
    setSelectedJobs(checked ? jobs.map((job) => job.id) : []);
  };

  const handleCloseSheet = () => {
    refetchJobs();
    setIsAddJobSheetOpen(false);
  };

  const handleSelectJob = (jobId) => {
    setSelectedJobs(prev => 
      prev.includes(jobId) 
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    );
  };

  const handleConfirmArchive = async () => {
    try {
      await fetch("/api/archiveJob", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ jobIds: selectedJobs }),
      });
      toast({
        title: "Jobs archived",
        description: `${selectedJobs.length} job(s) have been archived.`,
      });
      setSelectedJobs([]);
      refetchJobs();
      setIsConfirmationDialogOpen(false);
    } catch (error) {
      console.error("Error archiving jobs:", error);
    }
  };

  const totalPages = Math.ceil(jobs.length / RECORDS_PER_PAGE);
  const paginatedJobs = jobs.slice(
    (currentPage - 1) * RECORDS_PER_PAGE,
    currentPage * RECORDS_PER_PAGE
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Job Listings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between">
            <div className="flex space-x-2">
              <Dialog
                open={isConfirmationDialogOpen}
                onOpenChange={setIsConfirmationDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    variant={selectedJobs.length === 0 ? "outline" : "destructive"}
                    disabled={selectedJobs.length === 0}
                    onClick={() => setIsConfirmationDialogOpen(true)}
                  >
                    Archive Selected
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirm Archive</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to archive the selected jobs?
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="destructive" onClick={handleConfirmArchive}>
                      Archive
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => setIsConfirmationDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <span className="text-sm text-muted-foreground self-center">
                {selectedJobs.length} job(s) selected
              </span>
            </div>
            <Button variant="default" onClick={() => setIsAddJobSheetOpen(true)}>
              <PlusCircledIcon className="w-4 h-4 mr-2" />
              Add Job
            </Button>
          </div>
          <ScrollArea className="h-[calc(100vh-300px)]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={selectedJobs.length === jobs.length}
                      onCheckedChange={handleSelectAllJobs}
                      aria-label="Select all"
                    />
                  </TableHead>
                  <TableHead>Posted</TableHead>
                  <TableHead>Job Title</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Screening Link</TableHead>
                  <TableHead className="text-center">Candidates</TableHead>
                  <TableHead className="text-center">Average Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedJobs.map((job) => {
                  const nonArchivedCandidates = job.candidates.filter(
                    (candidate) => candidate.status !== "ARCHIVED"
                  );

                  const totalScore = nonArchivedCandidates.reduce(
                    (acc, candidate) => acc + Number(candidate.phoneScreen?.qualificationScore || 0),
                    0
                  );

                  const avgScore = nonArchivedCandidates.length > 0
                    ? (totalScore / nonArchivedCandidates.length).toFixed(2)
                    : "-";

                  const createdAtDate = parseISO(job.createdAt);
                  const daysSinceCreated = formatDistanceToNow(createdAtDate, {
                    addSuffix: true,
                  });

                  return (
                    <TableRow key={job.id}>
                      <TableCell className="w-[50px]">
                        <Checkbox
                          checked={selectedJobs.includes(job.id)}
                          onCheckedChange={() => handleSelectJob(job.id)}
                          aria-label="Select row"
                        />
                      </TableCell>
                      <TableCell className="text-xs">{daysSinceCreated}</TableCell>
                      <TableCell>
                        <Link href={`/jobs/${job.id}`} className="underline">
                          {job.jobTitle}
                        </Link>
                      </TableCell>
                      <TableCell>{job.jobLocation}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">
                          <ExternalLinkIcon className="w-4 h-4 mr-2" />
                          <Link href={`/apply/${job.uuid}`} target="_blank">
                            Screen
                          </Link>
                        </Button>
                      </TableCell>
                      <TableCell className="text-center">
                        {nonArchivedCandidates.length}
                      </TableCell>
                      <TableCell className="text-center">{avgScore}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </ScrollArea>
          {totalPages > 1 && (
            <div className="flex justify-center mt-4">
              {Array.from({ length: totalPages }, (_, index) => (
                <Button
                  key={index}
                  variant={currentPage === index + 1 ? "default" : "outline"}
                  onClick={() => handlePageChange(index + 1)}
                  className="mx-1"
                >
                  {index + 1}
                </Button>
              ))}
            </div>
          )}
        </div>
      </CardContent>
      <AddJobSheet
        isOpen={isAddJobSheetOpen}
        onClose={() => setIsAddJobSheetOpen(false)}
        companyId={companyId}
        onJobAdded={refetchJobs}
      />
    </Card>
  );
};

export default JobTable;
