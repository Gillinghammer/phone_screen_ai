import { prisma } from '../../lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const {
      companyId,
      userId,
      jobTitle,
      jobLocation,
      jobDescription,
      requirements,
      responsibilities,
      seniority,
      salary,
      remoteFriendly,
      interviewQuestions,
      companyName,
      // Candidate details
      name,
      email,
      phone,
      linkedinUrl,
      hiringManagerEmail
    } = req.body;

    console.log('Received job:', JSON.stringify(req.body, null, 2));

    // Check for previous applications in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentApplication = await prisma.candidate.findFirst({
      where: {
        email,
        createdAt: {
          gte: thirtyDaysAgo
        },
        jobPost: {
          companyName
        }
      },
      include: {
        jobPost: true
      }
    });

    if (recentApplication) {
      return res.status(400).json({
        message: 'You have already applied to this company within the last 30 days. Please wait before applying again.'
      });
    }

    // First, create the job
    const jobResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/create-job`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        companyId,
        userId,
        jobTitle,
        jobLocation,
        jobDescription,
        requirements,
        responsibilities,
        seniority,
        salary,
        remoteFriendly,
        interviewQuestions,
        companyName,
      }),
    });

    if (!jobResponse.ok) {
      throw new Error('Failed to create job');
    }

    const job = await jobResponse.json();

    // Then create the application
    const applicationResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jobId: job.id,
        name,
        email,
        phone,
        linkedinUrl,
        hiringManagerEmail,
        isOutbound: true, // Set to true for candidates created through this endpoint
        job: {
          jobTitle,
          jobLocation,
          jobDescription,
          requirements,
          responsibilities,
          remoteFriendly,
          seniority,
          salary,
          interviewQuestions
        }
      }),
    });

    if (!applicationResponse.ok) {
      throw new Error('Failed to create application');
    }

    const application = await applicationResponse.json();

    res.status(201).json({
      job,
      application,
    });
  } catch (error) {
    console.error('Error in create-and-apply:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
