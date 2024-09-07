import { PrismaClient } from "@prisma/client";
import { format } from "date-fns";

const prisma = new PrismaClient();

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
  });

  return jobs.map((job) => ({
    ...job,
    createdAt: format(job.createdAt, "yyyy-MM-dd HH:mm:ss"),
    updatedAt: format(job.updatedAt, "yyyy-MM-dd HH:mm:ss"),
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
          phoneScreen: {
            select: { id: true, callLength: true, qualificationScore: true },
          },
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
      phoneScreen: candidate.phoneScreen ? { ...candidate.phoneScreen } : null,
    })),
  };
}
