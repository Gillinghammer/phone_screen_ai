// javascript api endpoint GET /api/v2/job/:jobId/questions
// parse jobId from the request query
// make sure the header contains a property called authorization with the value of the NEXTAUTH_SECRET
import prisma from "../../../../../lib/prisma";

export default async function handler(req, res) {
  if (req.headers.authorization !== process.env.NEXTAUTH_SECRET) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  if (req.method === "GET") {
    const jobId = parseInt(req.query.jobId, 10);
    console.log("job id", jobId);

    if (!jobId) {
      return res.status(400).json({ message: "Missing or invalid parameters" });
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

      return res.status(200).json({
        questions: questionSet,
        status: 200,
      });
    } catch (error) {
      console.error("Error fetching questions:", error);
      return res
        .status(500)
        .json({ message: "Internal server error", status: 500 });
    }
  } else {
    return res.status(405).json({ message: "Method not allowed", status: 405 });
  }
}

// OLD CODE WHICH FETCHES 1 Question

// export default async function handler(req, res) {
//   if (req.headers.authorization !== process.env.NEXTAUTH_SECRET) {
//     return res.status(401).json({ message: "Unauthorized" });
//   }
//   if (req.method === "GET") {
//     const jobId = parseInt(req.query.jobId, 10);
//     console.log("job id", jobId);
//     const questionIndex = parseInt(req.query.index, 10);
//     console.log("question index", questionIndex);
//     const nextQuestion = questionIndex + 1;
//     if (!jobId || isNaN(questionIndex)) {
//       return res.status(400).json({ message: "Missing or invalid parameters" });
//     }

//     try {
//       const job = await prisma.job.findUnique({
//         where: {
//           id: parseInt(jobId, 10),
//         },
//       });

//       if (!job) {
//         return res.status(404).json({ message: "Job not found" });
//       }

//       const { interviewQuestions } = job;
//       // console.log("interviewQuestions", interviewQuestions);
//       const questionSet = interviewQuestions?.set || [];
//       // console.log("questionSet", questionSet);
//       if (questionIndex < 0 || questionIndex >= questionSet.length) {
//         return res
//           .status(404)
//           .json({ message: "Question not found", status: 404 });
//       }

//       const question = questionSet[questionIndex];
//       console.log("question", question);
//       return res.status(200).json({
//         question,
//         next_question: questionIndex + 1,
//         status: 200,
//       });
//     } catch (error) {
//       console.error("Error fetching question:", error);
//       return res
//         .status(500)
//         .json({ message: "Internal server error", status: 500 });
//     }
//   } else {
//     return res.status(405).json({ message: "Method not allowed", status: 405 });
//   }
// }
