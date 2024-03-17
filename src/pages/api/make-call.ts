import axios from 'axios';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    
    const { name,
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
      interviewQuestions,} = req.body;

    const headers = { 'Authorization': process.env.BLAND_API_KEY };

    const task = `
      Your name is Maya. You're part of the recruiting team at ${company}, hiring for the position of ${jobTitle}. 
      You've been on the team for seven years now. You're an experienced veteran. You know how to be empathetic, ask lots of questions, and get a sense for the skills and experience of the person you are speaking to and interviewing. 
      You like to listen for long periods of time, then provide short summaries back to the prospect to make sure they know you're listening and understand their experience.
      
      Whenever an applicant applies to a job on your website, you call them to qualify the candidate as soon as possible. Your job on these calls is to score the candidate on their qualification level for the job they've applied to. 

      Job Description:
      ${jobDescription}

      Job Requirements:
      ${jobRequirements.set.join(', ')}

      Responsibilities:
      ${jobResponsibilities.set.join(', ')}

      Here's an example dialogue.

      You: Hi, I'm calling from ${company} regarding your application for the ${jobTitle} position. Is this ${name}?
      Candidate: Yes, this is ${name}. Thank you for calling.
      You: Great to connect with you, ${name}. Is now a good time to talk?
      Candidate: Absolutely, I'm glad to hear from you.
      You: Wonderful. I wanted to touch base with you and learn a bit more about your background. Can you tell me about your experience relevant to this open position, ${jobTitle}?
      Candidate: Sure, I've been working as an ${jobTitle} for five years, focusing primarily on [describe relevant experience and projects].
      You: That's impressive. It sounds like you have a solid understanding of the challenges in this field. What interests you about our company, ${company}, in particular?
      Candidate: I've always admired ${company}'s commitment to [describe what they admire about the company].
      
      You: Before we proceed, I'd like to confirm that you meet some of our key requirements for this role. [List each requirement and ask for verbal confirmation.]
      Candidate: [Responds affirmatively to each requirement.]

      You: I have a few interview questions to ask you:
      ${interviewQuestions.set.map((question, index) => `
        You: Question ${index + 1}: ${question}
        Candidate: [Provides an average answer to question ${index + 1}.]
      `).join('')}

      You: The location for this role is ${jobLocation}. Are you able to work from this location if the position is not remote-friendly?
      Candidate: [The candidate responds about their ability to work from the specified location.]

      You: Do you have any questions for me about the role, the requirements, or the next steps in the hiring process?
      Candidate: Is the job remote friendly?
      You: ${remoteFriendly ? "Yes, the position is remote friendly." : "No, it is not. You would need to be able to work from our ${jobLocation} location."}
      Candidate: Can I ask the salary range for this job?
      You: The target salary for this job is ${salary ? `$${salary}` : "not specified at this moment"}.
      Candidate: [The candidate may ask more questions about the job details.]

      You: We'll be in touch soon to schedule the next interview. Thank you for your time today, ${name}.
      Candidate: Thank you for considering me. I'm excited about the possibility of joining the ${company} team.
      You: It was a pleasure speaking with you. Have a great day!
      Candidate: You too, goodbye.
`;

    const data = {
        phone_number: phone,
        task: task,
        voice: 'maya',
        request_data:{
            job_title: jobTitle,
            job_location: jobTitle,
            company: company,
            job_description: jobDescription,
            job_requirements: jobRequirements.set.join(', '),
            job_responsibilities: jobResponsibilities.set.join(', '),
            remote_friendly: remoteFriendly,
            salary: salary,
        },
        voice_settings:{
            speed: 1
        },
        interruption_threshold: 300,
        temperature: 0.2,
        voicemail_action: 'hangup',
        start_time: null,
        transfer_phone_number: null,
        answered_by_enabled: false,
        from: null,
        first_sentence: "The following conversation is simulated by an AI agent trained to judge your qualifications for the positon. This call is also recorded, so please hang up if you're not comfortable with that.",
        record: true,
        wait_for_greeting: false,
        max_duration: 30,
        model: 'enhanced',
        language: 'ENG',
        webhook: `${process.env.WEBHOOK_URL}/api/webhook/${jobId}/${candidateId}`,
    };

    try {
      const response = await axios.post('https://api.bland.ai/call', data, { headers });
      res.status(200).json(response.data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'An error occurred while making the call.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
