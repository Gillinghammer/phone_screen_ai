import OpenAI from "openai";
export const dynamic = "force-dynamic";
export const config = {
  maxDuration: 300,
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const gpt_4o = "gpt-4o-2024-08-06";

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
    try {
      const details = req.body.details;
      console.log('Received job details:', details?.substring(0, 100) + '...')

      try {
        console.log('Starting first OpenAI request: Parse job posting')
        const jobResponse = await openai.chat.completions.create({
          model: gpt_4o,
          messages: [
            { 
              role: "system", 
              content: jobParserPrompt + "\nKeep responses concise. Summarize long text fields. Limit each array to 5-7 items maximum." 
            },
            { role: "user", content: details },
          ],
          response_format: { type: "json_object" },
          max_tokens: 2048,
          temperature: 0.7,
          tools: [{
            type: "function",
            function: {
              name: "parse_job_posting",
              description: "Parse a job posting into structured data. Keep descriptions concise and limit arrays to 5-7 items.",
              parameters: {
                type: "object",
                properties: {
                  company: { 
                    type: "string",
                    description: "Name of the company offering the position (max 100 chars)"
                  },
                  job_title: { 
                    type: "string",
                    description: "Title of the job position (max 100 chars)"
                  },
                  job_location: { 
                    type: "string",
                    description: "Location where the job is based (max 100 chars)"
                  },
                  job_description: { 
                    type: "string",
                    description: "Brief overview of the job role (max 250 chars)"
                  },
                  remote_friendly: { 
                    type: "boolean",
                    description: "Whether the job allows remote work"
                  },
                  seniority: { 
                    type: "string",
                    description: "Level of experience required (Entry, Mid, Senior)"
                  },
                  salary: { 
                    type: "integer",
                    description: "Estimated annual salary in USD"
                  },
                  requirements: { 
                    type: "array", 
                    items: { type: "string" },
                    description: "List of key job requirements (max 5 items, each max 100 chars)"
                  },
                  responsibilities: { 
                    type: "array", 
                    items: { type: "string" },
                    description: "List of key job responsibilities (max 5 items, each max 100 chars)"
                  }
                },
                required: [
                  "company", "job_title", "job_location", "job_description",
                  "remote_friendly", "seniority", "salary", "requirements",
                  "responsibilities"
                ],
                additionalProperties: false
              }
            }
          }],
          tool_choice: { type: "function", function: { name: "parse_job_posting" } }
        });

        console.log('Received job parsing response')
        console.log('Response structure:', JSON.stringify(jobResponse.choices[0].message, null, 2));
        
        if (!jobResponse.choices[0].message.tool_calls) {
          console.error('No tool_calls in response:', jobResponse.choices[0].message);
          return res.status(500).json({ error: 'Invalid API response format: No tool_calls found' });
        }

        const toolCall = jobResponse.choices[0].message.tool_calls[0];
        if (!toolCall.function?.arguments) {
          console.error('No function arguments in tool call:', toolCall);
          return res.status(500).json({ error: 'Invalid API response format: No function arguments found' });
        }

        // Check for truncation in the arguments string
        const argsStr = toolCall.function.arguments;
        if (argsStr.endsWith('...') || argsStr.endsWith('"') || !argsStr.endsWith('}')) {
          console.error('Response appears to be truncated:', argsStr);
          return res.status(500).json({ 
            error: 'Truncated API response',
            details: 'The response from the API was incomplete. Please try again with a shorter job description.',
            rawData: argsStr
          });
        }

        let parsedJob;
        try {
          parsedJob = JSON.parse(argsStr);
        } catch (parseError) {
          console.error('JSON Parse Error:', parseError);
          console.error('Raw arguments string:', argsStr);
          // Try to clean the string if it's truncated
          if (argsStr.lastIndexOf('}') > -1) {
            try {
              const cleanedStr = argsStr.substring(0, argsStr.lastIndexOf('}') + 1);
              parsedJob = JSON.parse(cleanedStr);
              console.log('Successfully parsed cleaned JSON');
            } catch (cleanError) {
              return res.status(500).json({ 
                error: 'Failed to parse job data',
                details: parseError.message,
                rawData: argsStr
              });
            }
          } else {
            return res.status(500).json({ 
              error: 'Failed to parse job data',
              details: parseError.message,
              rawData: argsStr
            });
          }
        }


        console.log('Starting second OpenAI request: Generate interview questions')
        const questionsResponse = await openai.chat.completions.create({
          model: gpt_4o,
          messages: [
            { 
              role: "system", 
              content: interviewQuestionsPrompt + "\nGenerate exactly 5 concise, focused questions. Each question should be under 100 characters." 
            },
            { role: "user", content: JSON.stringify(parsedJob) },
          ],
          response_format: { type: "json_object" },
          max_tokens: 1024,
          temperature: 0.7,
          tools: [{
            type: "function",
            function: {
              name: "generate_interview_questions",
              description: "Generate 5 focused interview questions based on job details. Keep questions concise.",
              parameters: {
                type: "object",
                properties: {
                  interview_questions: { 
                    type: "array", 
                    items: { 
                      type: "string",
                      description: "A focused interview question (max 100 chars)"
                    },
                    description: "List of 5 interview questions"
                  }
                },
                required: ["interview_questions"],
                additionalProperties: false
              }
            }
          }],
          tool_choice: { type: "function", function: { name: "generate_interview_questions" } }
        });

        console.log('Received interview questions response')
        console.log('Questions response structure:', JSON.stringify(questionsResponse.choices[0].message, null, 2));

        if (!questionsResponse.choices[0].message.tool_calls) {
          console.error('No tool_calls in questions response:', questionsResponse.choices[0].message);
          return res.status(500).json({ error: 'Invalid API response format: No tool_calls found in questions response' });
        }

        const questionToolCall = questionsResponse.choices[0].message.tool_calls[0];
        if (!questionToolCall.function?.arguments) {
          console.error('No function arguments in questions tool call:', questionToolCall);
          return res.status(500).json({ error: 'Invalid API response format: No function arguments found in questions response' });
        }

        // Check for truncation in the arguments string
        const questionArgsStr = questionToolCall.function.arguments;
        if (questionArgsStr.endsWith('...') || questionArgsStr.endsWith('"') || !questionArgsStr.endsWith('}')) {
          console.error('Questions response appears to be truncated:', questionArgsStr);
          return res.status(500).json({ 
            error: 'Truncated API response',
            details: 'The questions response was incomplete. Please try again.',
            rawData: questionArgsStr
          });
        }

        let generatedQuestions;
        try {
          generatedQuestions = JSON.parse(questionArgsStr);
        } catch (parseError) {
          console.error('Questions JSON Parse Error:', parseError);
          console.error('Raw questions arguments string:', questionArgsStr);
          // Try to clean the string if it's truncated
          if (questionArgsStr.lastIndexOf('}') > -1) {
            try {
              const cleanedStr = questionArgsStr.substring(0, questionArgsStr.lastIndexOf('}') + 1);
              generatedQuestions = JSON.parse(cleanedStr);
              console.log('Successfully parsed cleaned questions JSON');
            } catch (cleanError) {
              return res.status(500).json({ 
                error: 'Failed to parse questions data',
                details: parseError.message,
                rawData: questionArgsStr
              });
            }
          } else {
            return res.status(500).json({ 
              error: 'Failed to parse questions data',
              details: parseError.message,
              rawData: questionArgsStr
            });
          }
        }

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
        console.error('Error during OpenAI request:', error)
        res.status(500).json({ error: 'An error occurred while processing the job posting' });
      }
    } catch (error) {
      console.error('Error during API call:', error)
      res.status(500).json({ error: 'An error occurred while processing the job posting' });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

export default parseJob;