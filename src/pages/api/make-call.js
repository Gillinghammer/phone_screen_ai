import axios from "axios";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const {
      name,
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

    const task = `BACKGROUND INFO: 
    You are an AI phone agent tasked with conducting an initial phone screen for the position of ${jobTitle} at ${company}. The role is ${jobTitle} with a competitive salary starting at $${salary}, located at ${jobLocation}. The ideal candidate should have experience with ${jobRequirements.set.join(
      ", "
    )}.
    ${
      remoteFriendly
        ? "This role is remote."
        : "This role is not remote-friendly and requires the canidate to work at the office."
    }
  
    Greeting the Candidate:
  
    Start the call with a friendly and professional greeting.
    Introduce yourself as an AI agent conducting the initial screen for the ${jobTitle} position at ${company}.
    Confirm you are speaking to the candidate ${name}, about the ${jobTitle} position.
  
    Conducting the Interview:
  
    Politely transition into the interview questions.
    ${interviewQuestions.set
      .map((question, index) => `Question ${index + 1}: ${question}`)
      .join("\n  ")}
    Listen attentively to the candidate's answers and make note of key points relevant to the job requirements.
    If any response is unclear, vague, or lacks details, ask the candidate to elaborate or provide additional examples.
  
    Wrapping Up the Interview:
  
    Thank the candidate for their time and participation in the interview.
    Inform them that their responses will be reviewed, and they will be contacted for further steps if they are shortlisted.
    Wish them good luck and end the call on a positive note.

    IMPORTANT:
    Do not give the candidate any indication of how well they are doing in the phone screen.
    Do no promise they will hear from you soon or that they will be contacted if they are shortlisted.
    Do stick to the interview questions ensuring you have asked each and every one of them. Do not make up questions on the fly.
  
    EXAMPLE DIALOGUE:
    You: Hello, this is the AI agent from ${company}. May I speak with ${name}?
    Candidate: Yes, this is ${name}.
    You: Great! I'm calling to conduct the initial phone screen for the ${jobTitle} position at ${company}. Thank you for your interest in this role. Are you ready to start the interview?
    Candidate: Yes, I'm ready.
    You: Excellent! Let's begin. ${interviewQuestions.set
      .map((question, index) => `Question ${index + 1}: ${question}`)
      .join("\n  ")}
    You: Thank you for your time and responses, ${name}. Your answers will be reviewed, and we will be in touch for the next steps if you are shortlisted. We wish you the best of luck!
    Candidate: Thank you for the opportunity.
    You: Have a great day, goodbye!
  
    INFORMATION ABOUT THE CANDIDATE:
    * Their preferred job title is ${jobTitle}
    * They are interested in a ${jobTitle} position
    * They have expressed interest in working with technologies such as ${jobRequirements.set.join(
      ", "
    )}
    * They are looking for a role with a salary starting at $${salary}
    `;

    const data = {
      phone_number: phone,
      task: task,
      voice: "e1289219-0ea2-4f22-a994-c542c2a48a0f",
      request_data: {
        job_title: jobTitle,
        job_location: jobTitle,
        company: company,
        job_description: jobDescription,
        job_requirements: jobRequirements.set.join(", "),
        job_responsibilities: jobResponsibilities.set.join(", "),
        remote_friendly: remoteFriendly,
        salary: salary,
      },
      voice_settings: {
        speed: 1,
      },
      interruption_threshold: 400,
      temperature: 0.2,
      voicemail_action: "hangup",
      start_time: null,
      transfer_phone_number: null,
      answered_by_enabled: false,
      from: null,
      first_sentence: null,
      record: true,
      wait_for_greeting: true,
      max_duration: 25,
      model: "enhanced",
      language: "ENG",
      webhook: `${process.env.WEBHOOK_URL}/api/webhook/${jobId}/${candidateId}`,
    };

    try {
      const response = await axios.post("https://api.bland.ai/call", data, {
        headers,
      });
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
