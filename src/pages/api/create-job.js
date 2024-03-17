import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { PrismaClient } from "@prisma/client";
import { getToken } from "next-auth/jwt";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const token = await getToken({ req });
  if (req.method === "POST") {
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
      return res
        .status(403)
        .json({ message: "You must be signed in to create a job." });
    }

    // Ensure all required fields are included in the request body
    const {
      company,
      job_title,
      job_location,
      job_description,
      remote_friendly,
      seniority,
      salary,
      requirements,
      responsibilities,
      interview_questions,
    } = req.body;

    // Check if the session contains a user and that user has an ID
    if (!session.user || !token.id) {
      return res.status(403).json({ message: "Invalid user session." });
    }

    try {
      const job = await prisma.job.create({
        data: {
          userId: token.id,
          company: company,
          jobTitle: job_title,
          jobLocation: job_location,
          jobDescription: job_description,
          remoteFriendly: remote_friendly,
          seniority,
          salary,
          requirements: { set: requirements },
          responsibilities: { set: responsibilities },
          interviewQuestions: { set: interview_questions },
        },
      });
      res.status(200).json(job);
    } catch (error) {
      res.status(500).json({
        message: "Something went wrong when creating the job.",
        error: error.message,
      });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
