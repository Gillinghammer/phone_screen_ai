// pages/jobs/[job_id].tsx
import { PrismaClient } from "@prisma/client";
import { getSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import Layout from "../../components/Layout";
import JobDetails from "../../components/JobDetails";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { ExternalLinkIcon } from "@radix-ui/react-icons";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { formatDistanceToNow, parseISO } from "date-fns";
import {
  EnvelopeClosedIcon,
  MobileIcon,
  Cross1Icon,
} from "@radix-ui/react-icons";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/router";

const RECORDS_PER_PAGE = 20;

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
      company: true,
      candidates: {
        include: {
          phoneScreen: true,
        },
      },
    },
  });

  // Check if the user belongs to the company that created the job
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user || (user.companyId !== job.companyId && user.id !== 1)) {
    return {
      redirect: {
        destination: "/auth/signin",
        permanent: false,
      },
    };
  }

  // Transform data to be serializable and format callLength
  const serializedJob = {
    ...job,
    createdAt: job.createdAt.toISOString(),
    updatedAt: job.updatedAt.toISOString(),
    company: {
      ...job.company,
      createdAt: job.company.createdAt.toISOString(),
      updatedAt: job.company.updatedAt.toISOString(),
    },
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
  console.log("debug job", job);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] =
    useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState("screened");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedStatus, setSelectedStatus] = useState("any");
  const [bulkChangeStatus, setBulkChangeStatus] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleSearchTermChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // console.log("debug job", job);

  const refreshData = () => {
    router.replace(router.asPath);
  };

  const getSortValue = (candidate, column) => {
    switch (column) {
      case "screened":
        return candidate.createdAt;
      case "name":
        return candidate.name;
      case "duration":
        const duration = candidate.phoneScreen?.callLength;
        if (duration) {
          const [minutes, seconds] = duration.split(":").map(Number);
          return minutes * 60 + seconds;
        }
        return 0;
      case "score":
        return candidate.phoneScreen?.qualificationScore ?? 0;
      case "status":
        return candidate.status.toLowerCase();
      default:
        return null;
    }
  };

  const getFilteredCandidates = (
    candidates,
    searchTerm,
    selectedStatus,
    sortColumn,
    sortOrder
  ) => {
    return candidates
      .filter((candidate) => {
        const nameMatch = candidate.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        const emailMatch = candidate.email
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        const phoneMatch = candidate.phone
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        return nameMatch || emailMatch || phoneMatch;
      })
      .filter((candidate) => candidate.status.toLowerCase() !== "archived")
      .filter(
        (candidate) =>
          candidate.status.toLowerCase() === selectedStatus ||
          selectedStatus === "any"
      )
      .sort((a, b) => {
        if (sortColumn) {
          const valueA = getSortValue(a, sortColumn);
          const valueB = getSortValue(b, sortColumn);

          if (typeof valueA === "string" && typeof valueB === "string") {
            return sortOrder === "asc"
              ? valueA.localeCompare(valueB)
              : valueB.localeCompare(valueA);
          } else {
            return sortOrder === "asc" ? valueA - valueB : valueB - valueA;
          }
        }
        return 0;
      });
  };

  const filteredCandidates = getFilteredCandidates(
    job.candidates,
    searchTerm,
    selectedStatus,
    sortColumn,
    sortOrder
  );

  const totalPages = Math.ceil(filteredCandidates.length / RECORDS_PER_PAGE);
  const paginatedCandidates = filteredCandidates.slice(
    (currentPage - 1) * RECORDS_PER_PAGE,
    currentPage * RECORDS_PER_PAGE
  );

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortOrder("asc");
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleSelectAllCandidates = (checked) => {
    setSelectedCandidates(
      checked ? filteredCandidates.map((candidate) => candidate.id) : []
    );
  };

  const handleSelectCandidate = (candidateId) => {
    const selectedIndex = selectedCandidates.indexOf(candidateId);
    let newSelectedCandidates = [];

    if (selectedIndex === -1) {
      newSelectedCandidates = newSelectedCandidates.concat(
        selectedCandidates,
        candidateId
      );
    } else if (selectedIndex === 0) {
      newSelectedCandidates = newSelectedCandidates.concat(
        selectedCandidates.slice(1)
      );
    } else if (selectedIndex === selectedCandidates.length - 1) {
      newSelectedCandidates = newSelectedCandidates.concat(
        selectedCandidates.slice(0, -1)
      );
    } else if (selectedIndex > 0) {
      newSelectedCandidates = newSelectedCandidates.concat(
        selectedCandidates.slice(0, selectedIndex),
        selectedCandidates.slice(selectedIndex + 1)
      );
    }

    setSelectedCandidates(newSelectedCandidates);
  };

  const handleConfirmChangeStatus = async (status) => {
    try {
      await fetch("/api/changeCandidateStatus", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ candidateIds: selectedCandidates, status }),
      });
      toast({
        title: "Candidate status updated",
        description: `${selectedCandidates.length} candidate(s) status have been updated to ${status}.`,
      });
      setSelectedCandidates([]);
      setIsConfirmationDialogOpen(false);
      setSelectedStatus("any");
      refreshData();
    } catch (error) {
      console.error("Error updating candidate status:", error);
    }
  };

  return (
    <>
      <Head>
        <title>{job.jobTitle}</title>
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
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{job.jobTitle}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-4xl font-bold">{job.jobTitle}</h1>
            <div className="flex space-x-4">
              <Button size="md" variant={"outline"} className="px-4">
                <div className="flex items-center">
                  <ExternalLinkIcon className="w-4 h-4 mr-2" />
                  <Link href={`/apply/${job.uuid}`} target="_blank">
                    Screen link
                  </Link>
                </div>
              </Button>
              <Button variant="outline" onClick={() => setIsDrawerOpen(true)}>
                Edit this job
              </Button>
            </div>
          </div>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Dialog
                open={isConfirmationDialogOpen}
                onOpenChange={setIsConfirmationDialogOpen}
              >
                <Select
                  value={selectedStatus}
                  onValueChange={(value) => {
                    if (value) {
                      setBulkChangeStatus(value);
                      setIsConfirmationDialogOpen(true);
                    }
                  }}
                >
                  <SelectTrigger
                    className={`${
                      selectedCandidates.length === 0 ? "opacity-50" : ""
                    } w-[180px]`}
                    disabled={selectedCandidates.length === 0}
                  >
                    <SelectValue placeholder="Change Status">
                      Change status
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACCEPTED">Accept</SelectItem>
                    <SelectItem value="REJECTED">Reject</SelectItem>
                    <SelectItem value="OPEN">Open</SelectItem>
                    <SelectItem value="ARCHIVED">Archive</SelectItem>
                  </SelectContent>
                </Select>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirm Status Change</DialogTitle>
                    <DialogDescription>
                      {bulkChangeStatus === "ACCEPTED" && (
                        <>
                          Are you sure you want to <strong>accept</strong> the
                          selected candidates?
                        </>
                      )}
                      {bulkChangeStatus === "REJECTED" && (
                        <>
                          Are you sure you want to <strong>reject</strong> the
                          selected candidates?
                        </>
                      )}
                      {bulkChangeStatus === "OPEN" && (
                        <>
                          Are you sure you want to mark the selected candidates
                          as <strong>open</strong>?
                        </>
                      )}
                      {bulkChangeStatus === "ARCHIVED" && (
                        <>
                          Are you sure you want to <strong>archive</strong> the
                          selected candidates?
                        </>
                      )}
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      onClick={() =>
                        handleConfirmChangeStatus(bulkChangeStatus)
                      }
                    >
                      Confirm
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
              <span className="text-sm text-muted-foreground">
                {selectedCandidates.length} candidate(s) selected
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Input
                type="text"
                placeholder="Search candidates"
                value={searchTerm}
                onChange={handleSearchTermChange}
                className="w-96"
              />
              <Select
                value={selectedStatus}
                onValueChange={(value) => setSelectedStatus(value)}
                placeholder="Filter by status"
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="any">all</SelectItem>
                    <SelectItem value="open">
                      <Badge variant="outline">open</Badge>
                    </SelectItem>
                    <SelectItem value="rejected">
                      <Badge variant="destructive">rejected</Badge>
                    </SelectItem>
                    <SelectItem value="accepted">
                      <Badge>accepted</Badge>
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={
                      selectedCandidates.length === filteredCandidates.length
                    }
                    onCheckedChange={handleSelectAllCandidates}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead onClick={() => handleSort("screened")}>
                  Screened{" "}
                  {sortColumn === "screened" &&
                    (sortOrder === "asc" ? "▲" : "▼")}
                </TableHead>
                <TableHead onClick={() => handleSort("name")}>
                  Name{" "}
                  {sortColumn === "name" && (sortOrder === "asc" ? "▲" : "▼")}
                </TableHead>
                <TableHead>Contact</TableHead>
                <TableHead onClick={() => handleSort("duration")}>
                  Duration{" "}
                  {sortColumn === "duration" &&
                    (sortOrder === "asc" ? "▲" : "▼")}
                </TableHead>
                <TableHead onClick={() => handleSort("score")}>
                  Score{" "}
                  {sortColumn === "score" && (sortOrder === "asc" ? "▲" : "▼")}
                </TableHead>
                <TableHead onClick={() => handleSort("status")}>
                  Status{" "}
                  {sortColumn === "status" && (sortOrder === "asc" ? "▲" : "▼")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedCandidates.length > 0 ? (
                paginatedCandidates.map((candidate) => {
                  const createdAtDate = parseISO(candidate.createdAt);
                  const daysSinceCreated = formatDistanceToNow(createdAtDate, {
                    addSuffix: true,
                  });
                  // unique badge color and variant needed for rejected, open, accepted status
                  const badgeVariant =
                    candidate.status.toLowerCase() === "rejected"
                      ? "destructive"
                      : candidate.status.toLowerCase() === "open"
                      ? "outline"
                      : "";
                  return (
                    <TableRow key={candidate.id}>
                      <TableCell className="w-[50px]">
                        <Checkbox
                          checked={selectedCandidates.includes(candidate.id)}
                          onCheckedChange={() =>
                            handleSelectCandidate(candidate.id)
                          }
                          aria-label="Select row"
                        />
                      </TableCell>
                      <TableCell className="text-xs">
                        {daysSinceCreated}
                      </TableCell>
                      <TableCell>
                        {candidate.phoneScreen ? (
                          <Link
                            href={`/jobs/${job.id}/${candidate.id}`}
                            className="underline"
                          >
                            {candidate.name}
                          </Link>
                        ) : (
                          <span>{candidate.name}</span>
                        )}
                      </TableCell>
                      <TableCell className="w-[280px]">
                        <div className="flex items-center space-x-2 mb-2">
                          <EnvelopeClosedIcon className="w-4 h-4 text-gray-500" />
                          <span>{candidate.email}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MobileIcon className="w-4 h-4 text-gray-500" />
                          <span className="text-xs">{candidate.phone}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {candidate.phoneScreen?.callLength ?? "-----"}
                      </TableCell>
                      <TableCell>
                        {candidate.phoneScreen?.qualificationScore.toFixed(2) ??
                          0}
                      </TableCell>
                      <TableCell>
                        <Badge variant={badgeVariant}>
                          {candidate.status.toLowerCase()}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <div className="flex flex-col items-center">
                      <h2 className="text-2xl font-semibold mb-4">
                        No candidates have applied
                      </h2>
                      <p className="text-lg text-muted-foreground mb-6">
                        Share your screen link with the candidates you would
                        like to screen for this job.
                      </p>
                      <Button
                        variant="outline"
                        size="lg"
                        className="w-fit px-6"
                      >
                        <ExternalLinkIcon className="w-4 h-4 mr-2" />
                        <Link href={`/apply/${job.uuid}`} target="_blank">
                          Screen link
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {totalPages > 1 && (
            <div className="flex justify-center mt-4">
              {Array.from({ length: totalPages }, (_, index) => (
                <Button
                  key={index}
                  variant={currentPage === index + 1 ? "" : "secondary"}
                  onClick={() => handlePageChange(index + 1)}
                >
                  {index + 1}
                </Button>
              ))}
            </div>
          )}
        </div>
        <Drawer open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}>
          <DrawerContent className="max-h-[80vh] px-12">
            <DrawerHeader>
              <div className="flex items-center justify-between w-full">
                <DrawerTitle>
                  Edit the details and screening questions for this job
                </DrawerTitle>
                <DrawerClose>
                  <Button
                    variant="ghost"
                    onClick={() => setIsDrawerOpen(false)}
                  >
                    <Cross1Icon className="w-6 h-6" />
                  </Button>
                </DrawerClose>
              </div>
            </DrawerHeader>
            <div className="overflow-y-auto px-4">
              <JobDetails
                jobData={{
                  job_id: job.id,
                  company: job.company.name,
                  job_title: job.jobTitle,
                  job_location: job.jobLocation,
                  job_description: job.jobDescription,
                  remote_friendly: job.remoteFriendly,
                  seniority: job.seniority,
                  salary: job.salary,
                  requirements: job.qualifications?.set,
                  responsibilities: job.responsibilities?.set,
                  interview_questions: job.interviewQuestions.set,
                }}
                setJobDetails={null}
                user={null}
                drawer={setIsDrawerOpen}
                refreshData={refreshData}
              />
            </div>
          </DrawerContent>
        </Drawer>
      </Layout>
    </>
  );
}
