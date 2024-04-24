// javascript api endpoint GET /api/v2/question
// parse jobId from the request query
// make sure the header contains a property called authorization with the value of the NEXTAUTH_SECRET
import prisma from "../../../../lib/prisma";
// fetch the job with the jobId
// parse interviewQuestions from the job
// return an array of all available questions or return null
export default async function handler(req, res) {
  if (req.method === "GET") {
    const { jobId } = req.query;
    console.log("GET QUESTIONS: ", req.query);
    if (!jobId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    try {
      const job = await prisma.job.findUnique({
        where: {
          id: parseInt(jobId, 10),
        },
      });

      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }

      const { interviewQuestions } = job;

      const questionSet = interviewQuestions?.set || [];
      if (questionSet.length === 0) {
        return res.status(200).json({
          questions: null,
          status: 500,
        });
      }

      const questions = questionSet;
      console.log("questions: ", questions);
      return res.status(200).json({
        questions,
        status: 200,
      });
    } catch (error) {
      console.error("Error fetching questions:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  } else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}
