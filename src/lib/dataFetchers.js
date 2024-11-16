import { prisma } from './prisma';
import { format } from "date-fns";

export async function getUserAndCompany(email) {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, companyId: true, name: true },
  });

  const company = await prisma.company.findUnique({
    where: { id: user.companyId },
    select: { id: true, name: true, domain: true },
  });

  return { user, company };
}

export async function getJobs(companyId) {
  let jobs = await prisma.job.findMany({
    where: { companyId, isArchived: false },
    select: {
      id: true,
      uuid: true,
      jobLocation: true,
      company: { select: { name: true } },
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
            select: { id: true, callLength: true, qualificationScore: true },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc'  // Sort by createdAt in descending order
    },
  });

  return jobs.map((job) => ({
    ...job,
    createdAt: format(job.createdAt, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
    updatedAt: format(job.updatedAt, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
    candidates: job.candidates.map((candidate) => ({
      ...candidate,
      phoneScreen: candidate.phoneScreen ? { ...candidate.phoneScreen } : null,
    })),
  }));
}

export async function fetchJob(jobId, userEmail) {
  const user = await prisma.user.findUnique({
    where: { email: userEmail },
    select: { companyId: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const job = await prisma.job.findFirst({
    where: {
      id: parseInt(jobId),
      companyId: user.companyId,
    },
    include: {
      company: {
        select: { name: true },
      },
      candidates: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          status: true,
          phoneScreen: true, // This will include all fields of phoneScreen
        },
      },
    },
  });

  if (!job) {
    return null;
  }

  return {
    ...job,
    createdAt: format(job.createdAt, "yyyy-MM-dd HH:mm:ss"),
    updatedAt: format(job.updatedAt, "yyyy-MM-dd HH:mm:ss"),
    candidates: job.candidates.map((candidate) => ({
      ...candidate,
      phoneScreen: candidate.phoneScreen
        ? {
            ...candidate.phoneScreen,
            createdAt: format(candidate.phoneScreen.createdAt, "yyyy-MM-dd HH:mm:ss"),
            updatedAt: format(candidate.phoneScreen.updatedAt, "yyyy-MM-dd HH:mm:ss"),
            endAt: candidate.phoneScreen.endAt 
              ? format(candidate.phoneScreen.endAt, "yyyy-MM-dd HH:mm:ss")
              : null,
            // Format any other date fields here if they exist
          }
        : null,
    })),
  };
}

export async function getPaginatedCandidates(jobId, filters = {}) {
  const { searchTerm, hideArchived, hideDroppedMissed } = filters;

  const where = {
    jobPostId: parseInt(jobId),
    ...(searchTerm && {
      OR: [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { email: { contains: searchTerm, mode: 'insensitive' } },
      ],
    }),
    ...(hideArchived && { status: { not: 'ARCHIVED' } }),
    ...(hideDroppedMissed && {
      OR: [
        { phoneScreen: { qualificationScore: { gt: 0 } } },
        { phoneScreen: null },
      ],
    }),
  };

  const candidates = await prisma.candidate.findMany({
    where,
    include: { phoneScreen: true },
    orderBy: { createdAt: 'desc' },
  });

  return candidates.map(candidate => ({
    ...candidate,
    createdAt: format(candidate.createdAt, "yyyy-MM-dd HH:mm:ss"),
    updatedAt: format(candidate.updatedAt, "yyyy-MM-dd HH:mm:ss"),
    phoneScreen: candidate.phoneScreen
      ? {
          ...candidate.phoneScreen,
          createdAt: format(candidate.phoneScreen.createdAt, "yyyy-MM-dd HH:mm:ss"),
          updatedAt: format(candidate.phoneScreen.updatedAt, "yyyy-MM-dd HH:mm:ss"),
          endAt: candidate.phoneScreen.endAt 
            ? format(candidate.phoneScreen.endAt, "yyyy-MM-dd HH:mm:ss")
            : null,
        }
      : null,
  }));
}

// Remove getTotalCandidates function as it's no longer needed

// ... other functions ...
