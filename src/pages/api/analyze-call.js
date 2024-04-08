// pages/api/analyze-call.js
import { PrismaClient } from "@prisma/client";
import axios from "axios";

const prisma = new PrismaClient();

export default async function analyzeCall(req, res) {
  if (req.method === "POST") {
    const { callId, jobId, phoneScreenId } = req.body;

    try {
      // Fetch the job and its interview questions
      const job = await prisma.job.findUnique({
        where: { id: parseInt(jobId) },
        select: { interviewQuestions: true },
      });

      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }

      // const scorePrompt =
      //   "Based on the human's response to this question rate their qualification on a 0 to 100 point scale. 0 indicates no answer or examples provided that demonstrate any experience or awareness of the question. 100 demonstrates a detailed, nuanced response with direct personal examples that perfectly answer the question. 50 indicates an acknowledgement and awareness of what is being asked but vaguely specified experience.";
      const scorePrompt = `
        Based on the human's response to this question rate their qualification on a 0 to 100 point scale. 
        Imagine you are the hiring manager and you need to determine if the human is qualified for the role based on the answers they provide to the questions.
        Some answers require short and simple responses, while others, where experience is being asked for, require more detailed responses.
        0 indicates a very poor answer or no answer at all.
        100 indicates a perfect answer that would satisfy our hiring manager.
        Your compensation is directly tied to the accuracy of your ratings.
      `;

      // Prepare the questions array for the 3rd party API request
      const questions = job.interviewQuestions?.set?.map((question) => [
        question,
        scorePrompt,
      ]);

      // Prepare the payload for the 3rd party API request
      const payload = {
        goal: "Determine if the human is qualified for the role based on the answers they provide to the agents questions.",
        questions,
      };

      // Send the request to the 3rd party API using Axios
      const response = await axios.post(
        `https://api.bland.ai/v1/calls/${callId}/analyze`,
        payload,
        {
          headers: {
            Accept: "*/*",
            "Content-Type": "application/json",
            authorization: process.env.BLAND_API_KEY,
          },
        }
      );

      // Update the PhoneScreen with the analysis result
      const updatedPhoneScreen = await prisma.phoneScreen.update({
        where: { id: phoneScreenId },
        data: {
          analysis: response.data,
          qualificationScore:
            response.data.answers
              .filter((item, index) => index % 2 !== 0)
              .reduce((acc, score) => acc + (Number(score) || 0), 0) /
            (response.data.answers.length / 2),
        },
      });

      // Send the analysis result back to the client
      res.status(200).json(updatedPhoneScreen);
    } catch (error) {
      console.error("Error analyzing the call:", error);
      res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }
  } else {
    // If the request method is not POST, return a 405 Method Not Allowed error
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
