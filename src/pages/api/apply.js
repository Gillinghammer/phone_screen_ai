import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handle(req, res) {
  const { name, email, phone, resumeUrl, jobId } = req.body;

  // Validate input data
  if (!name || !email || !phone || !jobId) {
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

    // Fetch the job details for the call
    const job = await prisma.job.findUnique({
      where: {
        id: parseInt(jobId, 10),
      },
    });

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Call the make-call API route with the necessary details
    const callResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/make-call`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          phone,
          jobId: jobId,
          company: job.company,
          candidateId: candidate.id,
          jobTitle: job.jobTitle,
          jobDescription: job.jobDescription,
          jobRequirements: job.requirements,
          jobResponsibilities: job.responsibilities,
          jobLocation: job.jobLocation,
          remoteFriendly: job.remoteFriendly,
          salary: job.salary,
          interviewQuestions: job.interviewQuestions,
        }),
      }
    );

    if (!callResponse.ok) {
      throw new Error("Failed to make call");
    }

    return res.status(200).json(candidate);
  } catch (error) {
    console.error("An error occurred:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
}
