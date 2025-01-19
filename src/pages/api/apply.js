import { prisma } from '../../lib/prisma';
import axios from 'axios';

// Helper function to normalize interview questions
function normalizeInterviewQuestions(questions) {
  if (!questions) return [];
  // If questions is an object with a 'set' property, extract the array
  if (typeof questions === 'object' && 'set' in questions) {
    return questions.set;
  }
  // If questions is already an array, return it
  if (Array.isArray(questions)) {
    return questions;
  }
  // If we get here, questions is in an unexpected format
  console.warn('Unexpected interview questions format:', questions);
  return [];
}

export default async function handle(req, res) {
  const { name, email, phone, resumeUrl = '', linkedinUrl = '', hiringManagerEmail = '', isOutbound = false, jobId, job } = req.body;

  // Debug logging
  console.log('Received job:', JSON.stringify(job, null, 2));
  console.log('Interview questions:', JSON.stringify(job.interviewQuestions, null, 2));

  // Validate input data
  if (!name || !email || !phone || !jobId || !job) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    // Create a new candidate in the database
    const candidate = await prisma.candidate.create({
      data: {
        name,
        email,
        phone,
        resumeUrl: '', // Always empty string as required
        linkedinUrl,
        hiringManagerEmail,
        isOutbound,
        jobPostId: parseInt(jobId, 10),
      },
    });

    // Create initial PhoneScreen record
    const phoneScreen = await prisma.phoneScreen.create({
      data: {
        candidateId: candidate.id,
        jobId: parseInt(jobId, 10),
        callId: "", // Will be updated when we get response from conversational server
        status: "pending",
      },
    });

    // Debug logging before making call
    const callPayload = {
      phoneNumber: phone,
      name,
      email,
      jobId,
      candidateId: candidate.id,
      phoneScreenId: phoneScreen.id,
      jobTitle: job.jobTitle,
      questions: normalizeInterviewQuestions(job.interviewQuestions),
      transcript_webhook: process.env.TRANSCRIPT_WEBHOOK
    };

    console.log('Call payload:', JSON.stringify(callPayload, null, 2));
    console.log('Conversational server URL:', process.env.CONVERSATIONAL_SERVER);

    let callResponse;
    try {
      callResponse = await axios.post(
        `${process.env.CONVERSATIONAL_SERVER}/call`,
        callPayload
      );
      
      // Update the PhoneScreen record with the call ID
      if (callResponse.data && callResponse.data.callId) {
        await prisma.phoneScreen.update({
          where: { id: phoneScreen.id },
          data: { callId: callResponse.data.callId },
        });
      }
    } catch (error) {
      console.error('Conversational server error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }

    res.status(201).json({
      candidate,
      phoneScreen,
      call: callResponse?.data || null,
    });
  } catch (error) {
    console.error('Error:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
