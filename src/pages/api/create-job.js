import { prisma } from '../../lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);

  try {
    const {
      companyId,
      companyName,
      userId,
      jobTitle,
      jobLocation,
      jobDescription,
      requirements,
      responsibilities,
      seniority,
      salary,
      remoteFriendly,
      interviewQuestions,
    } = req.body;

    let user;
    if (userId) {
      // If userId is provided, fetch user directly
      user = await prisma.user.findUnique({
        where: { id: userId },
      });
    } else {
      // Otherwise use session email to find user
      user = await prisma.user.findUnique({
        where: { email: session?.user?.email },
      });
    }

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const job = await prisma.job.create({
      data: {
        companyName,
        jobDescription,
        jobLocation,
        jobTitle,
        requirements,
        responsibilities,
        seniority,
        salary,
        remoteFriendly,
        interviewQuestions,
        company: {
          connect: { id: companyId },
        },
        user: {
          connect: { id: user.id },
        },
      },
    });

    res.status(201).json(job);
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
