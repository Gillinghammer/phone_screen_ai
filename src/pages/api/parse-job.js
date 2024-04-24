// pages/api/process-job-posting.js
import OpenAI from "openai";

// Set up your OpenAI API key
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Set up your OpenAI instance
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper function to call OpenAI's API
const askGPT = async (
  content,
  systemContent = "You are a program designed to return string values based on the input you receive. Do not include any preamble text, simply a single valid string value."
) => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-0125",
      messages: [
        {
          role: "system",
          content: systemContent,
        },
        { role: "user", content },
      ],
    });
    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error(`Error during API call: ${error}`);
    return "";
  }
};

const extractCompanyName = async (details) => {
  const prompt = `Extract the company name from the following job posting:\n\n${details}`;
  return askGPT(prompt);
};

const extractJobTitle = async (details) => {
  const prompt = `Extract the job title from the following job posting:\n\n${details}`;
  return askGPT(prompt);
};

const extractJobDescription = async (details) => {
  const prompt = `Extract the job description from the following job posting, keep it short and sweet, no excess details:\n\n${details}`;
  return askGPT(prompt);
};

const extractSeniority = async (details) => {
  const prompt = `Extract the seniority level from the following job posting:\n\n${details}`;
  return askGPT(prompt);
};

const extractSalary = async (details) => {
  const rule =
    "You are a machine that only returns valid integers as your response. You will be given a salary and need to format and return it as an integer";
  const prompt = `Extract the salary, if available, from the following job posting:\n\n${details}`;
  return askGPT(prompt, rule);
};

const extractJobLocation = async (details) => {
  const prompt = `Extract the job location as city and 2 letter state abreviation like Miami, FL or Milwaukee, WI from the following job posting:\n\n${details}`;
  return askGPT(prompt);
};

const isRemoteFriendly = async (details) => {
  const rule =
    "You are a machine that only returns valid true or false boolean response.";
  const prompt = `Determine if the job is offered as remote work or work from home position, you must explicitly see that remote work is offered or that a work from home arrangement is acceptable:\n\n${details}`;
  const response = await askGPT(prompt, rule);
  return response.toLowerCase() === "true";
};

const extractRequirements = async (details) => {
  const rule =
    "Your response should consist of a list of strings, each on a separate line. DO NOT include any bullets or numbered bullets in your reponse, sentences only.";
  const prompt = `Extract a list of the important job requirements for the candidate to be deemed qualified for the job listing, maximum of 10. DO NOT list company benefits, compensation information, or hiring practices information. Only list the requirements detailed specifically in the job listing:\n\n${details}`;
  const response = await askGPT(prompt, rule);
  return response
    .split("\n")
    .map((req) => req.trim())
    .filter((req) => req);
};

const extractResponsibilities = async (details) => {
  const rule =
    "Your response should consist of a list of strings, each on a separate line. Do not include any bullets or numbered bullets.";
  const prompt = `Extract a list of job responsibilities, limit to 10, from the following job posting:\n\n${details}`;
  const response = await askGPT(prompt, rule);
  return response
    .split("\n")
    .map((resp) => resp.trim())
    .filter((resp) => resp);
};

const generateInterviewQuestions = async (details) => {
  const rule =
    "Your response should consist of a list of strings, each on a separate line. Do not include any bullets or numbered bullets. DO NOT include any intoductory pre-text or follow up text in your response. DO NOT include numbered bullets";
  const prompt = `Write 10 fully formed interview questions (use full sentences that end in question marks as if you were asking these on the phone to the candidate) for the initial phone screen based on the following job posting:\n\n${details}`;
  const response = await askGPT(prompt, rule);
  const questions = response
    .split("\n")
    .map((question) => question.trim())
    .filter((question) => question);
  return questions.slice(0, 10);
};

// API route handler
const parseJob = async (NextApiRequest, NextApiResponse) => {
  if (NextApiRequest.method === "POST") {
    const details = NextApiRequest.body.details;
    const extractedInfo = {
      company: await extractCompanyName(details),
      job_title: await extractJobTitle(details),
      job_location: await extractJobLocation(details),
      job_description: await extractJobDescription(details),
      remote_friendly: await isRemoteFriendly(details),
      seniority: await extractSeniority(details),
      salary: parseInt(await extractSalary(details)),
      requirements: await extractRequirements(details),
      responsibilities: await extractResponsibilities(details),
      interview_questions: await generateInterviewQuestions(details),
    };

    NextApiResponse.status(200).json(extractedInfo);
  } else {
    NextApiResponse.setHeader("Allow", ["POST"]);
    NextApiResponse.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

export default parseJob;
