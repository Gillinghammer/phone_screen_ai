import { prisma } from '../../lib/prisma';
import axios from 'axios';

export default async function handle(req, res) {
  const { name, email, phone, resumeUrl, jobId, job } = req.body;

  // Validate input data
  if (!name || !email || !phone || !jobId || !job) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    // Create a new candidate in the database
    const candidate = await prisma.candidate.create({
      data: {
        name,
        email,
        phone,
        resumeUrl,
        jobPostId: parseInt(jobId, 10),
      },
    });

    // Create initial PhoneScreen record
    const phoneScreen = await prisma.phoneScreen.create({
      data: {
        candidateId: candidate.id,
        jobId: parseInt(jobId, 10),
        callId: "", // Will be updated when we get response from conversational server
        status: "pending",
      },
    });

    // Make the call request to the conversational server
    const callResponse = await axios.post(
      `${process.env.CONVERSATIONAL_SERVER}/call`,
      {
        phoneNumber: phone,
        name: name,
        email: email,
        jobId: jobId,
        candidateId: candidate.id,
        phoneScreenId: phoneScreen.id,
        jobTitle: job.jobTitle,
        jobLocation: job.jobLocation,
        jobDescription: job.jobDescription,
        remoteFriendly: job.remoteFriendly,
        seniority: job.seniority,
        salary: job.salary,
        requirements: job.requirements.set,
        responsibilities: job.responsibilities.set,
        questions: job.interviewQuestions.set,
        transcript_webhook: process.env.TRANSCRIPT_WEBHOOK
      },
      {
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

    return res.status(200).json({
      candidate,
      call: callResponse.data
    });
  } catch (error) {
    console.error("An error occurred:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
}
