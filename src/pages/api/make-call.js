import axios from "axios";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const {
      name,
      email,
      phone,
      jobTitle,
      jobDescription,
      jobRequirements,
      jobResponsibilities,
      jobLocation,
      jobId,
      candidateId,
      remoteFriendly,
      salary,
      company,
      interviewQuestions,
    } = req.body;

    const headers = { Authorization: process.env.BLAND_API_KEY };

    const task = `<GOAL>
      Your goal is to conduct an initial phone screen with a candidate for the position of ${jobTitle} at ${company}. The purpose of this call is to assess the candidate's qualifications, experience, and fit for the role by asking a set of predefined interview questions. You should also provide the candidate with an opportunity to ask questions about the role and the company.
      </GOAL>

      <BACKGROUND_INFO>
      As an AI phone agent named Ashley, you are representing ${company} in this initial phone screen. The following details about the position will help you provide context to the candidate:
      - Title: ${jobTitle}
      - Description: ${jobDescription}
      - Requirements: ${jobRequirements.set.join(", ")}
      - Responsibilities: ${jobResponsibilities.set.join(", ")}
      - Location: ${jobLocation}
      - Salary: Starting at $${salary}
      - Remote-friendly: ${remoteFriendly ? "Yes" : "No"}
      </BACKGROUND_INFO>

      <CALL_FLOW>
      1. Greet the candidate and introduce yourself as Ashley from ${company}.
      2. Confirm that you are speaking with ${name} about the ${jobTitle} role.
      3. Provide a brief overview of the call, including the purpose and expected duration.
      4. Ask the predefined interview questions one by one, listening attentively to the responses.
      5. If needed, ask follow-up questions to clarify or gather more details.
      6. After asking all the questions, allow the candidate to ask any questions they may have.
      7. Answer the candidate's questions based on the provided job details, noting any you can't answer.
      8. Thank the candidate for their time and inform them of the next steps in the process.
      9. End the call on a positive note.
      </CALL_FLOW>

      <PREPARED_INTERVIEW_QUESTIONS>
      ${interviewQuestions.set
        .map((question, index) => `${index + 1}. ${question}`)
        .join("\n")}
      </PREPARED_QUESTIONS>

      <EXAMPLE_DIALOGUE>
      You: Hello, is this ${name}?
      Candidate: Yes, this is ${name}.
      You: Hi ${name}, this is Ashley, an AI agent from ${company}. I'm calling to conduct an initial phone screen for the ${jobTitle} position. Is now still a good time to talk?
      Candidate: Yes, now is a great time.
      You: Great! This call should take about 10 minutes. I'll be asking you a series of questions related to your experience and qualifications for the role. Feel free to ask any questions you may have at the end. Let's get started!
      You: (Ask the <PREPARED_INTERVIEW_QUESTIONS>)
      You: That covers all the questions I had prepared. Before we wrap up, do you have any questions for me about the role or the company?
      Candidate: (Asks questions)
      You: (Answer questions based on provided information)
      You: Thank you for your thoughtful questions, ${name}. That's all the time we have for today. We appreciate your interest in the ${jobTitle} position and the time you took for this phone screen. Our team will review your responses and will be in touch regarding the next steps. Best of luck, and have a great rest of your day!
      Candidate: Thank you, Ashley. You too!
      </EXAMPLE_DIALOGUE>

      <IMPORTANT_NOTES>
      - Maintain a friendly, professional, and confident tone throughout the call.
      - Stick to the interview questions provided above, avoid asking anything outside of these questions. 
      - For any vague answers try to ask the candidate to provide specific examples.
      - Avoid indicating to the candidate how well they performed.
      - Do not guarantee a timeline for next steps or promise that they will be contacted if shortlisted.
      - If faced with technical difficulties, apologize and attempt to resolve them promptly.
      </IMPORTANT_NOTES>
    `;
    console.log("debug", task);
    const data = {
      phone_number: phone,
      from: "+16469339096",
      task: task,
      voice: "e1289219-0ea2-4f22-a994-c542c2a48a0f",
      request_data: {
        job_title: jobTitle,
        job_location: jobTitle,
        company: company,
        candidateName: name,
        candidateEmail: email,
        job_description: jobDescription,
        job_requirements: jobRequirements.set.join(", "),
        job_responsibilities: jobResponsibilities.set.join(", "),
        remote_friendly: remoteFriendly,
        salary: salary,
      },
      voice_settings: {
        speed: 1,
      },
      interruption_threshold: 800,
      temperature: 0,
      voicemail_action: "hangup",
      start_time: null,
      transfer_phone_number: null,
      answered_by_enabled: false,
      first_sentence: null,
      record: true,
      wait_for_greeting: false,
      max_duration: 25,
      model: "gpt4",
      language: "ENG",
      webhook: `${process.env.WEBHOOK_URL}/api/webhook/${jobId}/${candidateId}`,
    };

    try {
      const response = await axios.post("https://api.bland.ai/call", data, {
        headers,
      });
      console.log("make call");
      res.status(200).json(response.data);
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "An error occurred while making the call." });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
