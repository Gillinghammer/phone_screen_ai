// pages/api/analyze-call.js
import { PostHog } from "posthog-node";
import { sendEmail } from "../../../lib/utils";
import { generateEmailTemplate } from "@/components/email-template";
import stripe from "../../../lib/stripe";

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

// Import the webhook function
import { postCandidateScreenedWebhook } from '@/lib/webhooks';

export default async function analyzeCall(req, res) {
  if (req.method === "POST") {
    const { callId, jobId, phoneScreenId } = req.body;

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
        model: "claude-3-5-sonnet-20240620", //"claude-3-sonnet-20240229", // "claude-3-5-sonnet-20240620"
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

      const scorePromises = questionsAndAnswers.map(async (qa) => {
        const { question, answer } = qa;
        const score = await anthropic.messages.create({
          model: "claude-3-5-sonnet-20240620", //"claude-3-haiku-20240307", // "claude-3-opus-20240229"
          max_tokens: 4096,
          temperature: 0,
          system: `You're a professional recruiter. 
            You're conducting a phone screen for a ${job.jobTitle}, a ${job.seniority} role. 
            Based on the provided candidate answer to the interview questions, you will score each answer on a scale of 0 to 100, where 0 is the worst possible answer and 100 is the best possible answer.
            You'll provide a json object in the following format: { score: integer, is_binary_question: boolean, reasoning: string }
            `,
          messages: [
            {
              role: "user",
              content: `
                Review the following interview question and the candidate's supplied answer below.

                <interview_question>
                ${question}
                </interview_question>

                <candidate_answer>
                ${answer}
                </candidate_answer>

                Some questions are simple yes or no questions which require a binary yes or no answer. Think about the <interview_question> and determine if it is a binary question.
                <is_binary_question></is_binary_question> // TRUE or FALSE

                Important: If the question is binary, assume the question is asking the candidate to confirm or deny a specific experience or skill and only provide a score of 100 if the candidate confirm's the experience or skill, otherwise you should score them a 0.
                
                <score_guidelines>
                If <is_binary_question> is TRUE, provide a score of 100 if the candidate answered correctly and a score of 0 if the candidate answered incorrectly.
                If <is_binary_question> is FALSE, provide a score between 0 and 100 based on the quality of the candidate's answer. A score of 0 indicates the candidate failed to provide an answer. A score of 100 indicates the candidate provided a perfect answer, demonstrating a deep understanding of the topic and providing specific examples to support their answer.
                Sometimes a candidate may not have a good answer and attempt to pivot the conversation or provide vague imprecise answers. In these cases, you should provide a score that reflects the candidate's lack of understanding or inability to provide a clear answer.
                </score_guidelines>

                <scoring_examples>
                Perfect Answer:
                <sample_question> "What is your experience with React?" </sample_question>
                <sample_answer> "I have 5 years of experience with React. I have worked on several projects including a large e-commerce platform where I was responsible for building the front-end using React and Redux. I also have experience with Next.js and Gatsby." </sample_answer>
                <sample_score> 100 </sample_score>
                Average Answer:
                <sample_question> "What is your experience with React?" </sample_question>
                <sample_answer> "I have some experience with React. I have worked on a few projects using React and Redux." </sample_answer>
                <sample_score> 50 </sample_score>
                Poor Answer:
                <sample_question> "What is your experience with React?" </sample_question>
                <sample_answer> "I have no experience with React." </sample_answer>
                <sample_score> 0 </sample_score>
                <sample_question> "Have you ever been a people manager?"</sample_question> (binary)
                <sample_answer> "No." </sample_answer>
                <sample_score> 0 </sample_score>
                <sample_question> "Do you posess a Commercial Driver License (CDL)?"</sample_question> (binary)
                <sample_answer> "Yes." </sample_answer>
                <sample_score> 100 </sample_score>
                <sample_question> "Are you willing to work the nigh shift?"</sample_question> (binary)
                <sample_answer> "No, sorry I'm not able to work a night shift" </sample_answer>
                <sample_score> 0 </sample_score>
                </scoring_examples>


                Take a moment to think about the <interview_question>, <candidate_answer>, and <is_binary_question> and the provided <score_guidelines> and determine the score and provide your <reasoning> for the score.

                <score></score> // Provide a score between 0 and 100
                <reasoning></reasoning> // Provide a brief reasoning for the score

                Now provide the score for the candidate's answer:
            `,
            },
            {
              role: "assistant",
              content: `{"score":`,
            },
          ],
        });

        const scoreText = score.content[0].text;
        const parsedScore = JSON5.parse(`{"score": ` + scoreText);
        return {
          score: parsedScore.score,
          is_binary_question: parsedScore.is_binary_question,
          reasoning: parsedScore.reasoning,
        };
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
            isBinaryQuestion: scores[i].is_binary_question,
            reasoning: scores[i].reasoning,
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

      const company = await prisma.company.findUnique({
        where: { id: job.companyId },
        select: {
          stripeCustomerId: true,
          webhookUrl: true,
        },
      });

      // Call the webhook if the URL exists
      if (company && company.webhookUrl) {
        console.log("Posting webhook to: ", company.webhookUrl);
        await postCandidateScreenedWebhook(company, updatedPhoneScreen, candidate, job);
      }

      // if updatedPhoneScreen.status === "call failed" then we don't want to create a meter event
      if (updatedPhoneScreen.status !== "call failed") {
        const meterEvent = await stripe.billing.meterEvents.create({
          event_name: "completed_screen",
          payload: {
            value: "1",
            stripe_customer_id: company.stripeCustomerId,
          },
        });
        console.log("Meter event created:", meterEvent);

        await axios.post("https://app.posthog.com/capture/", captureEvent, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        const subject = `Phone screen completed for the ${job.jobTitle} role`;

        await sendEmail({
          to: candidate.email,
          subject: subject,
          text: "Thank you for completing your phone screen. This email confirms that your answers will be shared with the recruiting team.",
          html: generateEmailTemplate({
            subject: subject,
            toEmail: candidate.email,
            fromEmail: "no-reply@phonescreen.ai",
            content:
              "Thank you for completing your phone screen. This email confirms that your answers will be shared with the recruiting team.",
          }),
        });
      }

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
