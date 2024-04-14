import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { PrismaClient } from "@prisma/client";
import { getToken } from "next-auth/jwt";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const token = await getToken({ req });
  if (req.method === "PUT") {
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
      return res
        .status(403)
        .json({ message: "You must be signed in to update a job." });
    }

    const {
      job_id,
      company,
      job_title,
      job_location,
      job_description,
      remote_friendly,
      seniority,
      salary,
      responsibilities,
      interview_questions,
    } = req.body;
    console.log("update job", req.body);

    if (!session.user || !token.id) {
      return res.status(403).json({ message: "Invalid user session." });
    }

    try {
      const job = await prisma.job.update({
        where: {
          id: job_id,
        },
        data: {
          company: {
            update: {
              name: company, // Assuming `company` is the updated company name
            },
          },
          jobTitle: job_title,
          jobLocation: job_location,
          jobDescription: job_description,
          remoteFriendly: remote_friendly,
          seniority,
          salary,
          responsibilities: { set: responsibilities },
          interviewQuestions: { set: interview_questions },
        },
      });
      res.status(200).json(job);
    } catch (error) {
      res.status(500).json({
        message: "Something went wrong when updating the job.",
        error: error.message,
      });
    }
  } else {
    res.setHeader("Allow", ["PUT"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
