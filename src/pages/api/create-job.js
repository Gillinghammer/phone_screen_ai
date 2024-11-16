import { prisma } from '../../lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import axios from 'axios';

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

    // Create the job
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

    // Create a Bland AI pathway
    const createPathwayResponse = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/bland/create-pathway`, {
      name: `Pathway for ${jobTitle}`,
      description: `Phone screen pathway for ${jobTitle} position`,
      questions: interviewQuestions.set,
      jobTitle: jobTitle,
      jobId: job.id
    });

    if (createPathwayResponse.data && createPathwayResponse.data.pathway_id) {
      // Update the job with the Bland AI pathway ID
      await prisma.job.update({
        where: { id: job.id },
        data: { blandPathwayId: createPathwayResponse.data.pathway_id },
      });

      job.blandPathwayId = createPathwayResponse.data.pathway_id;
    }

    res.status(201).json(job);
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({
      message: "Something went wrong when creating the job.",
      error: error.message,
    });
  }
}
