import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const {
      companyId,
      jobTitle,
      jobLocation,
      jobDescription,
      remoteFriendly,
      seniority,
      salary,
      requirements,
      responsibilities,
      interviewQuestions,
    } = req.body;

    // Fetch the user based on the session
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const job = await prisma.job.create({
      data: {
        userId: user.id,
        companyId,
        jobTitle,
        jobLocation,
        jobDescription,
        remoteFriendly,
        seniority,
        salary: salary || 0,
        requirements,
        responsibilities,
        interviewQuestions,
      },
    });

    res.status(201).json(job);
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({
      message: "Something went wrong when creating the job.",
      error: error.message,
    });
  }
}
