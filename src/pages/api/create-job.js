import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { PrismaClient } from "@prisma/client";
import { getToken } from "next-auth/jwt";
import { postJobAddedWebhook } from '@/lib/webhooks';

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
    console.log("add job", req.body);
    // Check if the session contains a user and that user has an ID
    if (!session.user || !token.id) {
      return res.status(403).json({ message: "Invalid user session." });
    }

    try {
      const job = await prisma.job.create({
        data: {
          userId: token.id,
          companyId,
          jobTitle,
          jobLocation,
          jobDescription,
          remoteFriendly,
          seniority,
          salary,
          requirements: { set: requirements },
          responsibilities: { set: responsibilities },
          interviewQuestions: { set: interviewQuestions },
        },
      });

      // Fetch the company to get the webhookUrl
      const company = await prisma.company.findUnique({
        where: { id: companyId },
      });

      // Call the webhook if the URL exists
      if (company && company.webhookUrl) {
        await postJobAddedWebhook(company, job);
      }

      res.status(200).json(job);
    } catch (error) {
      console.error("Error creating job:", error);
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
