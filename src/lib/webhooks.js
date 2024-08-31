async function postToWebhook(company, eventType, payload) {
  if (!company.webhookUrl) return;

  try {
    await fetch(company.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: eventType,
        timestamp: new Date().toISOString(),
        data: payload,
      }),
    });
  } catch (error) {
    console.error(`Error posting ${eventType} webhook:`, error);
  }
}

// Remove type annotation
function generateJobPayload(job) {
  return {
    id: job.id,
    uuid: job.uuid,
    jobTitle: job.jobTitle,
    jobDescription: job.jobDescription,
    jobLocation: job.jobLocation,
    remoteFriendly: job.remoteFriendly,
    seniority: job.seniority,
    salary: job.salary,
    interviewQuestions: job.interviewQuestions,
    responsibilities: job.responsibilities,
    requirements: job.requirements,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
    companyId: job.companyId,
    userId: job.userId
  };
}

// Remove type annotations
function generateCandidateScreenedPayload(phoneScreen, candidate, job) {
  return {
    phoneScreen: {
      id: phoneScreen.id,
      createdAt: phoneScreen.createdAt,
      updatedAt: phoneScreen.updatedAt,
      callLength: phoneScreen.callLength,
      completed: phoneScreen.completed,
      concatenatedTranscript: phoneScreen.concatenatedTranscript,
      correctedDuration: phoneScreen.correctedDuration,
      language: phoneScreen.language,
      recordingUrl: phoneScreen.recordingUrl,
      status: phoneScreen.status,
      qualificationScore: phoneScreen.qualificationScore,
      // analysisV2: phoneScreen.analysisV2
    },
    candidate: {
      id: candidate.id,
      name: candidate.name,
      phone: candidate.phone,
      email: candidate.email,
      createdAt: candidate.createdAt,
      updatedAt: candidate.updatedAt
    },
    job: generateJobPayload(job)
  };
}

// Remove type annotations
export async function postJobAddedWebhook(company, job) {
  await postToWebhook(company, 'Job Added', generateJobPayload(job));
}

// Remove type annotations
export async function postJobUpdatedWebhook(company, job) {
  await postToWebhook(company, 'Job Updated', generateJobPayload(job));
}

// Remove type annotations
export async function postCandidateScreenedWebhook(company, phoneScreen, candidate, job) {
  await postToWebhook(company, 'Candidate Screened', generateCandidateScreenedPayload(phoneScreen, candidate, job));
}