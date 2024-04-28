import axios from "axios";
import getCallScript from "../../components/CallScript";
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

    const script = getCallScript({
      jobTitle,
      company,
      jobDescription,
      jobResponsibilities: jobResponsibilities.set,
      jobRequirements: jobRequirements.set,
      jobLocation,
      salary,
      remoteFriendly,
      name,
      interviewQuestions: interviewQuestions.set,
    });
    console.log("debug", script);
    const data = {
      phone_number: phone,
      from: "+16469339096",
      task: script,
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
        speed: 0.5,
      },
      interruption_threshold: 390, // 500 bad it repeats the call from the beginning, 400 is ok but iterupts
      temperature: 0,
      voicemail_action: "hangup",
      start_time: null,
      transfer_phone_number: null,
      answered_by_enabled: false,
      first_sentence: null,
      record: true,
      wait_for_greeting: false,
      max_duration: 25,
      model: "gpt4", //"gpt4",
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
