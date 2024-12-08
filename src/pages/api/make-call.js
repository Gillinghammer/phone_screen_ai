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
      pathwayId
    } = req.body;
    console.log("DEBUG JOB ID", jobId);
    const headers = { Authorization: process.env.BLAND_API_KEY,
      encrypted_key: process.env.BLAND_ENCRYPTION_KEY
      };

    const requestData = {
      jobTitle,
      job_location: jobTitle,
      // company: company,
      candidate_name: name,
      questions: interviewQuestions.set,
      job_id: jobId, // needed for the pathway to lookup the first question
      // candidateEmail: email,
      job_description: jobDescription,
      job_requirements: jobRequirements.set.join(", "),
      job_responsibilities: jobResponsibilities.set.join(", "),
      remote_friendly: remoteFriendly,
      salary: salary,
      // interviewQuestions: interviewQuestions.set,
    }

    console.log("DEBUG REQUEST DATA", requestData);

    const data = {
      phone_number: phone,
      from: "+16506996300",
      // task: script,
      voice: "13843c96-ab9e-4938-baf3-ad53fcee541d", //"e1289219-0ea2-4f22-a994-c542c2a48a0f",
      pathway_id: pathwayId,
      request_data: requestData,
      voice_settings: {
        speed: 0.5,
      },
      interruption_threshold: 200,
      temperature: 0.5,
      voicemail_action: "hangup",
      start_time: null,
      transfer_phone_number: null,
      answered_by_enabled: true,
      first_sentence: null,
      record: true,
      wait_for_greeting: false,
      max_duration: 25,
      model: "gpt4", //"gpt4",
      language: "ENG",
      webhook: `${process.env.WEBHOOK_URL}/api/webhook/${jobId}/${candidateId}`,
    };

    try {
      const response = await axios.post("https://api.bland.ai/v1/calls", data, {
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
