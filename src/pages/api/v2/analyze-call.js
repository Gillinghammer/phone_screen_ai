// pages/api/analyze-call.js
import { PostHog } from "posthog-node";
import { sendEmail } from "../../../lib/utils";
import { generateEmailTemplate } from "@/components/email-template";
export const dynamic = "force-dynamic"; // static by default, unless reading the request
// This function can run for a maximum of 5 seconds
export const config = {
  maxDuration: 300,
};
import Anthropic from "@anthropic-ai/sdk";
import JSON5 from "json5";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});
import { PrismaClient } from "@prisma/client";
import axios from "axios";

const prisma = new PrismaClient();
const client = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
  host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
});

export default async function analyzeCall(req, res) {
  if (req.method === "POST") {
    const { callId, jobId, phoneScreenId } = req.body;

    console.log("Request body:", req.body);

    try {
      // Fetch the job and its interview questions
      const job = await prisma.job.findUnique({
        where: { id: parseInt(jobId) },
        select: {
          interviewQuestions: true,
          jobTitle: true,
          seniority: true,
          userId: true,
          companyId: true,
        },
      });

      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      console.log("Job:", job);

      // Prepare the questions array for the 3rd party API request
      const questions = job.interviewQuestions?.set;

      const response = await axios.get(
        `https://api.bland.ai/v1/calls/${callId}`,
        {
          headers: {
            authorization: process.env.BLAND_API_KEY,
          },
        }
      );

      const alignedTranscript = response.data.transcripts;
      const msg = await anthropic.messages.create({
        model: "claude-3-sonnet-20240229", // "claude-3-opus-20240229", //"claude-3-haiku-20240307"
        max_tokens: 4096,
        temperature: 0,
        system: "You're a helpful assistant.",
        messages: [
          {
            role: "user",
            content: `
            
            You will be given a conversation transcript that takes place between a candidate (speaker:"user") and an interviewer (speaker:"assistant"). 
            You task is to isolate the questions asked by the interviewer and the answers given by the candidate. 
            You can ignore any formalities, small chat, or other irrelevant conversation.

            <interview_questions>
            ${questions.map((q) => `<question>${q}</question>`).join("\n")}
            </interview_questions>

            <conversation_transcript>
            ${alignedTranscript
              .map((msg) => {
                if (msg.user === "assistant") {
                  return `<assistant>${msg.text}</assistant>`;
                } else {
                  return `<user>${msg.text}</user>`;
                }
              })
              .join("\n")}
            </conversation_transcript>

            Generate an array of the questions asked by the interviewer. 
            Each question should be paired with the candidate's exact answer. 
            Please do not record any of the questions asked by the candidate about the role, stick to the interview questions. 
            If a question was asked twice only include it once in your response.
            If you cannot find the candidate's answer to a question, just leave the answer "candidate failed to provide an answer"
            
            Use the following format:
            [
                {
                    "question": "The interviewer's question goes here...", // ONLY QUESTIONS ASKED BY THE INTERVIEWER
                    "answer": "The candidate's answer goes here..." // ONLY ANSWERS GIVEN BY THE CANDIDATE
                },
                {
                    "question": "Another question from the interviewer...", // ONLY QUESTIONS ASKED BY THE INTERVIEWER
                    "answer": "The candidate's answer to the second question..."  // ONLY ANSWERS GIVEN BY THE CANDIDATE
                },
                ...
            ]

        `,
          },
          {
            role: "assistant",
            content: "[",
          },
        ],
      });

      const questionsAndAnswers = JSON5.parse(`[${msg.content[0].text}`);
      console.log(questionsAndAnswers);

      const scorePromises = questionsAndAnswers.map(async (qa) => {
        const { question, answer } = qa;
        const score = await anthropic.messages.create({
          model: "claude-3-haiku-20240307", // "claude-3-opus-20240229"
          max_tokens: 4096,
          temperature: 0,
          system: `You're a professional recruiter. 
            You're conducting a phone screen for a ${job.jobTitle}, a ${job.seniority} role. 
            Based on the provided candidate answer to the interview questions, you will score each answer on a scale of 0 to 100, where 0 is the worst possible answer and 100 is the best possible answer.
            You'll provide a json object in the following format: {score: integer }
            `,
          messages: [
            {
              role: "user",
              content: `
                Consider the following interview question, and determine if it is a simply yes or no binary question or if it is asking for the candidate to provide specific examples of their experience. Simply stating they have a number of years of experience with a technology or skill is not enough to score highly on this question.
                <interview_question>
                ${question}
                </interview_question>

                <is_binary_question></is_binary_question> // true or false
                
                To help determine the most accurate score possible, take a moment to think through what the perfect, avaerage, and bad answers to this question might look like. 
                We want to make sure a candidate cannot just make up an answer to a question and get a high score, so please make sure to consider the context of the question and the role.

                <example_perfect_answer></example_perfect_answer> // score 90-100
                <example_average_answer></example_average_answer> // score 50-70
                <example_bad_answer></example_bad_answer> // score 0-20

                With these in mind, consider the candidate's answer and score it accordingly.
    
                <candidate_answer>
                ${answer}
                </candidate_answer>

                Now provide the score for the candidate's answer:
            `,
            },
            {
              role: "assistant",
              content: `{"score":`,
            },
          ],
        });
        console.log("Score:", score);
        // console.log("{score:", score.content[0].text);

        return JSON5.parse(`{score: ${score.content[0].text}`);
      });

      const scores = await Promise.all(scorePromises);

      // Update the PhoneScreen with the analysis result
      const qualificationScore =
        scores.reduce((acc, answer) => acc + (answer?.score ?? 0), 0) /
        scores.length;

      const updatedPhoneScreen = await prisma.phoneScreen.update({
        where: { id: phoneScreenId },
        data: {
          analysis: [],
          analysisV2: questionsAndAnswers.map((qa, i) => ({
            question: qa.question,
            answer: qa.answer,
            score: scores[i].score,
          })),
          qualificationScore,
          status: qualificationScore < 1 ? "call failed" : undefined,
        },
      });

      const candidate = await prisma.candidate.findUnique({
        where: { id: updatedPhoneScreen.candidateId },
        select: {
          name: true,
          email: true,
        },
      });

      let captureEvent = {
        api_key: process.env.NEXT_PUBLIC_POSTHOG_KEY,
        distinct_id: job.userId,
        event: "Candidate Screen Completed",
        properties: {
          companyId: job.companyId,
          jobId: job.id,
          userId: job.userId,
          title: job.jobTitle,
          location: job.jobLocation,
          duration: updatedPhoneScreen.correctedDuration,
          score: qualificationScore,
          price: updatedPhoneScreen.price,
          status: updatedPhoneScreen.status,
          candidate: candidate.name,
          email: candidate.email,
          fromNumber: updatedPhoneScreen.from,
          toNumber: updatedPhoneScreen.to,
        },
      };

      try {
        await axios.post("https://app.posthog.com/capture/", captureEvent, {
          headers: {
            "Content-Type": "application/json",
          },
        });
      } catch (err) {
        console.error("PostHog had an error!", err);
        console.error(
          "PostHog had an error: ",
          err?.response?.data || "Unknown"
        );
      }

      await sendEmail({
        to: candidate.email,
        subject: "Password Reset",
        text: "Thank you for completing your phone screen. This email confirms that your answers will be shared with the recruiting team.",
        html: generateEmailTemplate({
          subject: `Phone Screen completed for the ${job.jobTitle} role`,
          toEmail: candidate.email,
          fromEmail: "no-reply@phonescreen.ai",
          content:
            "Thank you for completing your phone screen. This email confirms that your answers will be shared with the recruiting team.",
        }),
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
