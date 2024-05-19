// pages/api/analyze-call.js

export const dynamic = "force-dynamic"; // static by default, unless reading the request
// This function can run for a maximum of 5 seconds
export const config = {
  maxDuration: 300,
};
import { PrismaClient } from "@prisma/client";
import axios from "axios";

const prisma = new PrismaClient();

export default async function analyzeCall(req, res) {
  if (req.method === "POST") {
    const { callId, jobId, phoneScreenId } = req.body;

    console.log("Request body:", req.body);

    try {
      // Fetch the job and its interview questions
      const job = await prisma.job.findUnique({
        where: { id: parseInt(jobId) },
        select: { interviewQuestions: true },
      });

      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }

      const scorePrompt = `
        Task: Evaluate the candidate's response to each interview question and provide a qualification score.

        Instructions:
        1. Carefully read the candidate's answer to the given question.
        2. Consider the role requirements and the level of detail and relevance in the candidate's response.
        3. Assign a score between 0 and 100 based on the following criteria:
          - 0: Complete non-answer even if the answer is poorly given.
          - 1-30: Candidate attempted to answer, but provided a poor answer that lacks detail, relevance, or fails to demonstrate necessary qualifications. Seems like they are gussing, or trying to pretend they know what they are talking about.
          - 31-60: Satisfactory answer that addresses the question but lacks depth or specific examples.
          - 61-90: Strong answer that directly addresses the question, provides relevant examples, and demonstrates required qualifications.
          - 91-100: Exceptional answer that not only meets but exceeds expectations, demonstrating strong expertise and experience directly related to the role.
        4. Format your response as a valid JSON object with the following keys:
          - "score": The numeric score between 0 and 100.
          - "answer": The candidate's original answer to the question.
          - RESPONSE FORMAT
          {
            "score": 75,
            "answer": "The candidate's answer goes here..."
          }

        Important Notes:
        - Short, simple questions require concise answers, while questions asking about experience should be evaluated based on the level of detail and relevance provided.
        - Aim to provide accurate scores as if you were the hiring manager assessing the candidate's qualifications. Your compensation is directly tied to the accuracy of your ratings.
        - If the candidate's answer is missing or cannot be evaluated, assign a score of 0 and explain that the candidate failed to provide an answer to the question.
        - Reply with only a valid JSON object containing the score and the candidate's answer. { 'answer': 'The candidate's answer goes here...', 'score': 75 }
        `;

      // Prepare the questions array for the 3rd party API request
      const questions = job.interviewQuestions?.set?.map((question) => [
        question,
        scorePrompt,
      ]);

      // Prepare the payload for the 3rd party API request
      const payload = {
        goal: "Determine if the human is qualified for the role based on the answers they provide to the agents questions. respond with a valid JSON object following the format { 'answer': 'The candidate's answer goes here...', 'score': 75 }",
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

      console.log("Response from the 3rd party API:", response.data.answers);

      // Update the PhoneScreen with the analysis result
      const updatedPhoneScreen = await prisma.phoneScreen.update({
        where: { id: phoneScreenId },
        data: {
          analysis: response.data,
          qualificationScore:
            response.data.answers.reduce(
              (acc, answer) => acc + (answer?.score ?? 0),
              0
            ) / response.data.answers.length,
        },
      });

      console.log("Updated phone screen:", updatedPhoneScreen);

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
