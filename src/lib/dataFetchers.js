import { prisma } from './prisma';
import { format } from "date-fns";

// Helper function to safely format dates
function safeFormatDate(date, formatStr) {
  if (!date) return null;
  try {
    return format(date, formatStr);
  } catch (error) {
    console.error('Invalid date:', date, error);
    return null;
  }
}

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

  return jobs
    .map((job) => {
      const createdAt = safeFormatDate(job.createdAt, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");
      const updatedAt = safeFormatDate(job.updatedAt, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");
      
      if (!createdAt || !updatedAt) return null;

      return {
        ...job,
        createdAt,
        updatedAt,
        candidates: job.candidates
          .map((candidate) => ({
            ...candidate,
            phoneScreen: candidate.phoneScreen ? { ...candidate.phoneScreen } : null,
          }))
          .filter(Boolean),
      };
    })
    .filter(Boolean);
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

  const createdAt = safeFormatDate(job.createdAt, "yyyy-MM-dd HH:mm:ss");
  const updatedAt = safeFormatDate(job.updatedAt, "yyyy-MM-dd HH:mm:ss");
  
  if (!createdAt || !updatedAt) return null;

  const validCandidates = job.candidates
    .map((candidate) => {
      if (!candidate) return null;
      
      if (candidate.phoneScreen) {
        const phoneScreenCreatedAt = safeFormatDate(candidate.phoneScreen.createdAt, "yyyy-MM-dd HH:mm:ss");
        const phoneScreenUpdatedAt = safeFormatDate(candidate.phoneScreen.updatedAt, "yyyy-MM-dd HH:mm:ss");
        const phoneScreenEndAt = safeFormatDate(candidate.phoneScreen.endAt, "yyyy-MM-dd HH:mm:ss");
        
        if (!phoneScreenCreatedAt || !phoneScreenUpdatedAt) return null;

        return {
          ...candidate,
          phoneScreen: {
            ...candidate.phoneScreen,
            createdAt: phoneScreenCreatedAt,
            updatedAt: phoneScreenUpdatedAt,
            endAt: phoneScreenEndAt,
          },
        };
      }

      return {
        ...candidate,
        phoneScreen: null,
      };
    })
    .filter(Boolean);

  return {
    ...job,
    createdAt,
    updatedAt,
    candidates: validCandidates,
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

  return candidates
    .map(candidate => {
      if (!candidate) return null;

      const candidateCreatedAt = safeFormatDate(candidate.createdAt, "yyyy-MM-dd HH:mm:ss");
      const candidateUpdatedAt = safeFormatDate(candidate.updatedAt, "yyyy-MM-dd HH:mm:ss");

      if (!candidateCreatedAt || !candidateUpdatedAt) return null;

      if (candidate.phoneScreen) {
        const phoneScreenCreatedAt = safeFormatDate(candidate.phoneScreen.createdAt, "yyyy-MM-dd HH:mm:ss");
        const phoneScreenUpdatedAt = safeFormatDate(candidate.phoneScreen.updatedAt, "yyyy-MM-dd HH:mm:ss");
        const phoneScreenEndAt = safeFormatDate(candidate.phoneScreen.endAt, "yyyy-MM-dd HH:mm:ss");

        if (!phoneScreenCreatedAt || !phoneScreenUpdatedAt) return null;

        return {
          ...candidate,
          createdAt: candidateCreatedAt,
          updatedAt: candidateUpdatedAt,
          phoneScreen: {
            ...candidate.phoneScreen,
            createdAt: phoneScreenCreatedAt,
            updatedAt: phoneScreenUpdatedAt,
            endAt: phoneScreenEndAt,
          },
        };
      }

      return {
        ...candidate,
        createdAt: candidateCreatedAt,
        updatedAt: candidateUpdatedAt,
        phoneScreen: null,
      };
    })
    .filter(Boolean);
}

// Remove getTotalCandidates function as it's no longer needed

// ... other functions ...
