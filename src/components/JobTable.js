import { useState } from "react";
import Link from "next/link";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import JobPostParser from "./JobPostParser";
import { Input } from "@/components/ui/input";
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
  const [selectedLocation, setSelectedLocation] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sorting, setSorting] = useState({ column: "", direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddJobSheetOpen, setIsAddJobSheetOpen] = useState(false);
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] =
    useState(false);

  const { toast } = useToast();

  console.log("jobs", jobs);

  const handleSort = (column) => {
    if (sorting.column === column) {
      setSorting({
        column,
        direction: sorting.direction === "asc" ? "desc" : "asc",
      });
    } else {
      setSorting({ column, direction: "asc" });
    }
  };

  const handleSelectAllJobs = (checked) => {
    setSelectedJobs(checked ? jobs.map((job) => job.id) : []);
  };

  const handleCloseSheet = () => {
    refetchJobs();
    setIsAddJobSheetOpen(false);
  };

  const handleSelectJob = (jobId) => {
    const selectedIndex = selectedJobs.indexOf(jobId);
    let newSelectedJobs = [];

    if (selectedIndex === -1) {
      newSelectedJobs = newSelectedJobs.concat(selectedJobs, jobId);
    } else if (selectedIndex === 0) {
      newSelectedJobs = newSelectedJobs.concat(selectedJobs.slice(1));
    } else if (selectedIndex === selectedJobs.length - 1) {
      newSelectedJobs = newSelectedJobs.concat(selectedJobs.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelectedJobs = newSelectedJobs.concat(
        selectedJobs.slice(0, selectedIndex),
        selectedJobs.slice(selectedIndex + 1)
      );
    }

    setSelectedJobs(newSelectedJobs);
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
      console.log("Archive jobs:", selectedJobs);
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

  const handleLocationChange = (location) => {
    setSelectedLocation(location === "all" ? "" : location);
    setCurrentPage(1);
  };

  const handleSearchTermChange = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const filteredJobs = jobs.filter((job) => {
    const locationMatch =
      selectedLocation === "" || job.jobLocation === selectedLocation;
    const titleMatch = job.jobTitle
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return locationMatch && titleMatch;
  });

  const sortedJobs = filteredJobs.sort((a, b) => {
    if (sorting.column === "daysSinceCreated") {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sorting.direction === "asc"
        ? dateA.getTime() - dateB.getTime()
        : dateB.getTime() - dateA.getTime();
    } else if (sorting.column === "location") {
      return sorting.direction === "asc"
        ? a.location.localeCompare(b.location)
        : b.location.localeCompare(a.location);
    } else if (sorting.column === "jobTitle") {
      return sorting.direction === "asc"
        ? a.jobTitle.localeCompare(b.jobTitle)
        : b.jobTitle.localeCompare(a.jobTitle);
    } else if (sorting.column === "candidates") {
      return sorting.direction === "asc"
        ? a.candidates.length - b.candidates.length
        : b.candidates.length - a.candidates.length;
    } else if (sorting.column === "avgScore") {
      const avgScoreA =
        a.candidates.reduce((acc, candidate) => {
          return acc + Number(candidate.phoneScreen?.qualificationScore || 0);
        }, 0) / a.candidates.length;
      const avgScoreB =
        b.candidates.reduce((acc, candidate) => {
          return acc + Number(candidate.phoneScreen?.qualificationScore || 0);
        }, 0) / b.candidates.length;
      return sorting.direction === "asc"
        ? avgScoreA - avgScoreB
        : avgScoreB - avgScoreA;
    }
    return 0;
  });

  const locationOptions = [...new Set(jobs.map((job) => job.jobLocation))];

  const totalPages = Math.ceil(sortedJobs.length / RECORDS_PER_PAGE);
  const paginatedJobs = sortedJobs.slice(
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
          <div className="flex flex-col space-y-2 sm:flex-row sm:justify-between sm:space-y-0 sm:space-x-2">
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
            <div className="flex space-x-2">
              <Select onValueChange={handleLocationChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locationOptions.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="text"
                placeholder="Search job titles"
                value={searchTerm}
                onChange={handleSearchTermChange}
                className="w-[200px]"
              />
              <Sheet open={isAddJobSheetOpen} onOpenChange={setIsAddJobSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="default">
                    <PlusCircledIcon className="w-4 h-4 mr-2" />
                    Add Job
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[80vw] max-w-[1200px] sm:max-w-none">
                  <SheetHeader>
                    <SheetTitle>Add Job</SheetTitle>
                    <SheetDescription>
                      Paste your job posting below and click "Parse Job" to automatically fill in the details.
                    </SheetDescription>
                  </SheetHeader>
                  <div className="h-[calc(100vh-120px)] mt-4">
                    <JobPostParser
                      companyId={companyId}
                      onClose={handleCloseSheet}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
          <ScrollArea className="h-[calc(100vh-300px)]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={selectedJobs.length === filteredJobs.length}
                      onCheckedChange={handleSelectAllJobs}
                      aria-label="Select all"
                    />
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("daysSinceCreated")}>
                    Posted {sorting.column === "daysSinceCreated" && (
                      <span>{sorting.direction === "asc" ? "▲" : "▼"}</span>
                    )}
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("jobTitle")}>
                    Job Title {sorting.column === "jobTitle" && (
                      <span>{sorting.direction === "asc" ? "▲" : "▼"}</span>
                    )}
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("location")}>
                    Location {sorting.column === "location" && (
                      <span>{sorting.direction === "asc" ? "▲" : "▼"}</span>
                    )}
                  </TableHead>
                  <TableHead>Screening Link</TableHead>
                  <TableHead className="text-center cursor-pointer" onClick={() => handleSort("candidates")}>
                    Candidates {sorting.column === "candidates" && (
                      <span>{sorting.direction === "asc" ? "▲" : "▼"}</span>
                    )}
                  </TableHead>
                  <TableHead className="text-center cursor-pointer" onClick={() => handleSort("avgScore")}>
                    Average Score {sorting.column === "avgScore" && (
                      <span>{sorting.direction === "asc" ? "▲" : "▼"}</span>
                    )}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedJobs.map((job) => {
                  const nonArchivedCandidates = job.candidates.filter(
                    (candidate) => candidate.status !== "ARCHIVED"
                  );

                  const totalScore = nonArchivedCandidates.reduce(
                    (acc, candidate) => {
                      return (
                        acc + Number(candidate.phoneScreen?.qualificationScore || 0)
                      );
                    },
                    0
                  );

                  const avgScore =
                    nonArchivedCandidates.length > 0
                      ? totalScore / nonArchivedCandidates.length
                      : NaN;

                  const displayAvgScore = isNaN(avgScore)
                    ? "-"
                    : avgScore.toFixed(2);

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
                        <Button size="sm" variant={"outline"}>
                          <ExternalLinkIcon className="w-4 h-4 mr-2" />
                          <Link href={`/apply/${job.uuid}`} target="_blank">
                            Screen
                          </Link>
                        </Button>
                      </TableCell>
                      <TableCell className="text-center">
                        {
                          job.candidates.filter(
                            (candidate) => candidate.status !== "ARCHIVED"
                          ).length
                        }
                      </TableCell>
                      <TableCell className="text-center">
                        {displayAvgScore}
                      </TableCell>
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
    </Card>
  );
};

export default JobTable;
