import OpenAI from "openai";
export const dynamic = "force-dynamic";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const model = "gpt-4o-2024-08-06";

const emailGuessPrompt = `
You are an AI assistant designed to guess the most likely email address for a company's recruiting or careers team.
Given a company name, provide your best guess for a professional email address that would reach their recruiting team.
Use common patterns like careers@company.com, recruiting@company.com, or hr@company.com.
Remove any spaces or special characters from the company name and convert to lowercase.

Start by asking yourself what the domain name is for the provided company name to get started.

Your response MUST be in this exact JSON format:
{
  "email": "careers@companyname.com"
}

Example for Apple Inc:
{
  "email": "careers@apple.com"
}
`;

const guessHiringEmail = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { company } = req.body;
  if (!company) {
    return res.status(400).json({ error: "Company name is required" });
  }

  try {
    console.log('Starting OpenAI request: Guess hiring email for', company);
    
    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        { role: "system", content: emailGuessPrompt },
        { role: "user", content: company },
      ],
      response_format: { type: "json_object" },
      functions: [
        {
          name: "guess_hiring_email",
          description: "Guess the most likely hiring team email for a company",
          parameters: {
            type: "object",
            properties: {
              email: {
                type: "string",
                description: "The guessed email address for the company's hiring team"
              }
            },
            required: ["email"]
          }
        }
      ]
    });

    console.log('OpenAI response:', JSON.stringify(completion.choices[0].message, null, 2));
    
    const responseContent = completion.choices[0].message.content;
    console.log('Raw response content:', responseContent);

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responseContent);
      console.log('Parsed response:', parsedResponse);
    } catch (parseError) {
      console.error('Error parsing response:', parseError);
      return res.status(500).json({ error: "Failed to parse OpenAI response" });
    }

    if (!parsedResponse || !parsedResponse.email) {
      console.error('Invalid response format:', parsedResponse);
      return res.status(500).json({ error: "Invalid response format from OpenAI" });
    }

    console.log('Returning email guess:', parsedResponse.email);
    res.status(200).json({ email: parsedResponse.email });
  } catch (error) {
    console.error('Error in guess-hiring-email:', error);
    if (error.response) {
      console.error('OpenAI error response:', error.response.data);
    }
    res.status(500).json({ error: "Failed to guess hiring email" });
  }
};

export default guessHiringEmail;
