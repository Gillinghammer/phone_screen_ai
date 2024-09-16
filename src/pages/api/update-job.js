import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { PrismaClient } from "@prisma/client";
import { getToken } from "next-auth/jwt";
import { postJobUpdatedWebhook } from '@/lib/webhooks';
import axios from 'axios';

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
      id,
      jobTitle,
      jobLocation,
      jobDescription,
      remoteFriendly,
      seniority,
      salary,
      requiredSkills,
      interviewQuestions,
      responsibilities,
      requirements,
    } = req.body;
    // console.log("Updating job:", req.body);

    if (!session.user || !token.id) {
      return res.status(403).json({ message: "Invalid user session." });
    }

    try {
      const job = await prisma.job.update({
        where: { id: parseInt(id) },
        data: {
          jobTitle,
          jobLocation,
          jobDescription,
          remoteFriendly: remoteFriendly === true || remoteFriendly === 'true',
          seniority,
          salary: salary ? parseInt(salary) : null,
          requirements,
          responsibilities,
          interviewQuestions,
        },
      });

      // console.log("Updated job:", job);

      // Fetch the company to get the webhookUrl
      const company = await prisma.company.findUnique({
        where: { id: job.companyId },
      });

      // Call the webhook if the URL exists
      if (company && company.webhookUrl) {
        await postJobUpdatedWebhook(company, job);
      }

      // If the job has a blandPathwayId, update the pathway
      
      const pathwayResponse = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/bland/update-pathway`, {
        pathwayId: job.blandPathwayId,
        jobId: job.id,
        jobTitle: job.jobTitle,
        interviewQuestions: job.interviewQuestions.set
      });
      console.log("Pathway response:", pathwayResponse);
      res.status(200).json(job);
    } catch (error) {
      console.error("Error updating job:", error);
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
