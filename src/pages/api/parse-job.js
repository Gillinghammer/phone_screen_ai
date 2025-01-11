import OpenAI from "openai";
export const dynamic = "force-dynamic";
export const config = {
  maxDuration: 300,
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const model = "gpt-4o-2024-08-06";

const jobParserPrompt = `
You are an AI assistant designed to parse job postings. 
Given a job posting, extract the required information and format it according to the specified JSON schema. 
Be accurate and concise in your extractions.
Your response should be in JSON format.
`;

const interviewQuestionsPrompt = `
Based on the provided job details, generate 7 short and succinct interview questions for the initial phone screen. 
The questions should be relevant to the job requirements and responsibilities.
Each question should be a full sentence ending with a question mark, as if you were asking these on the phone to the candidate.
Your response should be in JSON format.
`;

const parseJob = async (req, res) => {
  if (req.method === "POST") {
    const details = req.body.details;
    console.log('Received job details:', details?.substring(0, 100) + '...')

    try {
      console.log('Starting first OpenAI request: Parse job posting')
      // First request: Parse job posting
      const jobResponse = await openai.chat.completions.create({
        model: model,
        messages: [
          { role: "system", content: jobParserPrompt },
          { role: "user", content: details },
        ],
        response_format: { type: "json_object" },
        functions: [
          {
            name: "parse_job_posting",
            description: "Parse a job posting into structured data",
            parameters: {
              type: "object",
              properties: {
                company: { type: "string" },
                job_title: { type: "string" },
                job_location: { type: "string" },
                job_description: { type: "string" },
                remote_friendly: { type: "boolean" },
                seniority: { type: "string" },
                salary: { type: "integer" },
                requirements: { 
                  type: "array", 
                  items: { type: "string" } 
                },
                responsibilities: { 
                  type: "array", 
                  items: { type: "string" } 
                },
              },
              required: [
                "company", "job_title", "job_location", "job_description",
                "remote_friendly", "seniority", "salary", "requirements",
                "responsibilities"
              ],
            },
          },
        ],
        function_call: { name: "parse_job_posting" },
      });

      console.log('Received job parsing response')
      const parsedJob = JSON.parse(jobResponse.choices[0].message.function_call.arguments);
      console.log('Parsed job data:', parsedJob)

      console.log('Starting second OpenAI request: Generate interview questions')
      // Second request: Generate interview questions
      const questionsResponse = await openai.chat.completions.create({
        model: model,
        messages: [
          { role: "system", content: interviewQuestionsPrompt },
          { role: "user", content: JSON.stringify(parsedJob) },
        ],
        response_format: { type: "json_object" },
        functions: [
          {
            name: "generate_interview_questions",
            description: "Generate interview questions based on job details",
            parameters: {
              type: "object",
              properties: {
                interview_questions: { 
                  type: "array", 
                  items: { type: "string" } 
                },
              },
              required: ["interview_questions"],
            },
          },
        ],
        function_call: { name: "generate_interview_questions" },
      });

      console.log('Received interview questions response')
      const generatedQuestions = JSON.parse(questionsResponse.choices[0].message.function_call.arguments);
      console.log('Generated questions:', generatedQuestions)

      // Merge parsed job and interview questions
      const finalResult = {
        ...parsedJob,
        ...generatedQuestions
      };

      // Ensure all required fields are present
      const requiredFields = [
        "company", "job_title", "job_location", "job_description",
        "remote_friendly", "seniority", "salary", "requirements",
        "responsibilities", "interview_questions"
      ];

      console.log('Checking required fields...')
      for (const field of requiredFields) {
        if (finalResult[field] === undefined) {
          console.error(`Missing required field: ${field}`)
          throw new Error(`Missing required field: ${field}`);
        }
      }

      console.log('All checks passed, sending response')
      res.status(200).json(finalResult);
    } catch (error) {
      console.error(`Error during API call:`, error)
      res.status(500).json({ error: "An error occurred while processing the job posting" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

export default parseJob;