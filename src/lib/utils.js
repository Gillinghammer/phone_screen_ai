import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { Resend } from 'resend';
import { generateEmailTemplate } from "@/components/email-template";
import axios from "axios";

/**
 * Merge class names with tailwind-merge
 * @param {...import("clsx").ClassValue[]} inputs
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

const resend = new Resend(process.env.NEXT_PUBLIC_RESEND_API_KEY);

/**
 * Send an email using the Resend service
 * @param {Object} params
 * @param {string} params.to
 * @param {string} params.subject
 * @param {string} params.html
 */
export async function sendEmail({ to, subject, html }) {
  try {
    const emailParams = {
      from: "no-reply@phonescreen.ai",
      to,
      subject,
      html
    };
    await resend.emails.send(emailParams);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

/**
 * Format call duration from seconds to minutes:seconds
 * @param {number} seconds
 * @returns {string}
 */
export function formatCallDuration(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Perform a bulk action on candidates
 * @param {Object} job
 * @param {string} action
 * @param {string[]} candidateIds
 */
export async function performBulkAction(job, action, candidateIds) {
  const actionMap = {
    approve: 'approved',
    reject: 'rejected',
    archive: 'archived'
  };

  const newStatus = actionMap[action];
  if (!newStatus) {
    throw new Error(`Invalid action: ${action}`);
  }

  // Update each candidate's status
  for (const candidateId of candidateIds) {
    const candidateRef = doc(db, 'jobs', job.id, 'candidates', candidateId);
    await updateDoc(candidateRef, {
      status: newStatus,
      updatedAt: serverTimestamp()
    });
  }
}

/**
 * Send an email to the hiring manager for qualified candidates
 * @param {Object} phoneScreen - The phone screen data
 * @param {Object} job - The job data
 * @param {Object} candidate - The candidate data
 */
export async function sendEmailHiringManager(phoneScreen, job, candidate) {
  if (!candidate.hiringManagerEmail) {
    console.log('No hiring manager email found for candidate:', candidate.id);
    return;
  }

  const isLocalDev = process.env.NEXT_PUBLIC_API_URL?.includes('localhost');
  
  // Store original email addresses for debug message
  const originalTo = candidate.hiringManagerEmail;
  const originalCc = candidate.email;

  // In local development, redirect emails to dev address
  const toEmail = isLocalDev ? 'colin+dev@phonescreen.ai' : candidate.hiringManagerEmail;
  const ccEmail = isLocalDev ? 'colin+dev@phonescreen.ai' : candidate.email;

  const debugInfo = isLocalDev ? `
    <div style="background-color: #f8f9fa; padding: 15px; margin-bottom: 20px; border-left: 4px solid #6c757d; border-radius: 4px;">
      <strong>[DEBUG INFO - Local Development]</strong><br/>
      In production, this email would be sent to:<br/>
      <strong>To:</strong> ${originalTo}<br/>
      <strong>CC:</strong> ${originalCc}
    </div>
  ` : '';

  // Format the transcript for better readability
  const formattedTranscript = phoneScreen.concatenatedTranscript
    .split('\n')
    .map(line => {
      if (line.startsWith('assistant:')) {
        return `<div style="margin: 10px 0;"><strong style="color: #0066cc;">Ashley:</strong> ${line.replace('assistant:', '').trim()}</div>`;
      } else if (line.startsWith('user:')) {
        return `<div style="margin: 10px 0 10px 20px;"><strong style="color: #28a745;">Candidate:</strong> ${line.replace('user:', '').trim()}</div>`;
      }
      return line;
    })
    .join('');

  const emailBody = `
    ${debugInfo}
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <p>You're receiving this email because <strong>${candidate.name}</strong> has just completed a live phone screen for the open <strong>${job.jobTitle}</strong> position.</p>

      <p>PhoneScreen.AI is a conversational AI recruiter that automatically qualifies candidates. We're emailing you because the candidate scored well on our assessment and we believe it is worth your time to speak with the candidate.</p>

      <div style="margin: 20px 0;">
        <strong>Candidate Details:</strong><br/>
        <ul style="list-style-type: none; padding-left: 0;">
          <li>📧 Email: ${candidate.email}</li>
          <li>📞 Phone: ${candidate.phone}</li>
          ${candidate.linkedinUrl ? `<li>🔗 LinkedIn: <a href="${candidate.linkedinUrl}">${candidate.linkedinUrl}</a></li>` : ''}
        </ul>
      </div>

      <div style="margin: 20px 0;">
        <strong>Phone Screen Resources:</strong>
        <ul style="list-style-type: none; padding-left: 0;">
          <li>🎧 <a href="${phoneScreen.recordingUrl}">Listen to the phone screen recording</a></li>
        </ul>
      </div>

      <div style="margin: 20px 0; background-color: #f8f9fa; padding: 15px; border-radius: 4px;">
        <strong>Phone Screen Transcript:</strong>
        <div style="margin-top: 10px;">
          ${formattedTranscript}
        </div>
      </div>

      <p style="color: #666; font-size: 0.9em; margin-top: 30px;">We take no commissions and are purely offering this service as good will.</p>
    </div>
  `;

  try {
    const emailParams = {
      from: "ashley@phonescreen.ai",
      to: toEmail,
      cc: ccEmail,
      bcc: "colin@phonescreen.ai",
      subject: `${job.jobTitle} | Pre qualified candidate ready to go!`,
      html: generateEmailTemplate({
        subject: `${job.jobTitle} | Pre qualified candidate ready to go!`,
        toEmail: toEmail,
        fromEmail: "ashley@phonescreen.ai",
        content: emailBody,
      }),
    };
    
    console.log(`${isLocalDev ? 'Sending development email to: ' + toEmail : 'Sending production email to: ' + originalTo}`);
    await resend.emails.send(emailParams);

    // Track email sent event in PostHog
    const captureEvent = {
      api_key: process.env.NEXT_PUBLIC_POSTHOG_KEY,
      event: "Hiring Manager Email Sent",
      distinct_id: candidate.id || 'anonymous',
      properties: {
        job_title: job.jobTitle,
        company: job.company,
        qualification_score: phoneScreen.qualificationScore,
        email_type: "hiring_manager",
        development_mode: isLocalDev,
        $current_url: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
      },
      timestamp: new Date().toISOString()
    };

    await axios.post("https://app.posthog.com/capture/", captureEvent, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.NEXT_PUBLIC_POSTHOG_KEY}`
      },
    });
  } catch (error) {
    console.error('Error sending hiring manager email:', error);
    throw error;
  }
}

/**
 * Send an email to the candidate with their interview feedback
 * @param {Object} phoneScreen - The phone screen data
 * @param {Object} job - The job data
 * @param {Object} candidate - The candidate data
 */
export async function sendEmailCandidate(phoneScreen, job, candidate) {
  if (!candidate.email) {
    console.log('No candidate email found:', candidate.id);
    return;
  }

  const isLocalDev = process.env.NEXT_PUBLIC_API_URL?.includes('localhost');
  
  // In local development, redirect emails to dev address
  const toEmail = isLocalDev ? 'colin+dev@phonescreen.ai' : candidate.email;

  // Format the feedback in a visually appealing way
  const formattedFeedback = phoneScreen.analysisV2
    .map(item => `
      <div style="margin-bottom: 25px; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
        <div style="margin-bottom: 15px;">
          <strong style="color: #2c3e50; font-size: 16px;">Question:</strong>
          <div style="margin-top: 5px; color: #34495e;">${item.question}</div>
        </div>
        
        <div style="margin-bottom: 15px;">
          <strong style="color: #2c3e50; font-size: 16px;">Your Answer:</strong>
          <div style="margin-top: 5px; color: #34495e;">${item.answer}</div>
        </div>
        
        <div style="margin-bottom: 15px;">
          <strong style="color: #2c3e50; font-size: 16px;">Score:</strong>
          <div style="margin-top: 5px;">
            <span style="
              display: inline-block;
              padding: 4px 12px;
              border-radius: 12px;
              font-weight: 600;
              ${item.score >= 80 ? 'background-color: #d4edda; color: #155724;' : 
                item.score >= 60 ? 'background-color: #fff3cd; color: #856404;' :
                'background-color: #f8d7da; color: #721c24;'}"
            >
              ${item.score}/100
            </span>
          </div>
        </div>
        
        <div>
          <strong style="color: #2c3e50; font-size: 16px;">Feedback:</strong>
          <div style="margin-top: 5px; color: #34495e;">${item.reasoning}</div>
        </div>
      </div>
    `)
    .join('');

  // Calculate overall performance
  const averageScore = phoneScreen.analysisV2.reduce((sum, item) => sum + item.score, 0) / phoneScreen.analysisV2.length;
  const performanceLevel = averageScore >= 80 ? 'Excellent' : averageScore >= 60 ? 'Good' : 'Needs Improvement';
  const performanceColor = averageScore >= 80 ? '#155724' : averageScore >= 60 ? '#856404' : '#721c24';
  const performanceBg = averageScore >= 80 ? '#d4edda' : averageScore >= 60 ? '#fff3cd' : '#f8d7da';

  const emailBody = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #2c3e50;">
      <h2 style="color: #2c3e50; margin-bottom: 20px;">Your AI Phone Screen Results</h2>
      
      <p>Thank you for completing your phone screen interview for the <strong>${job.jobTitle}</strong> position at <strong>${job.companyName}</strong>.</p>

      <div style="margin: 25px 0; padding: 20px; background-color: #f0f4f8; border-radius: 8px; border-left: 4px solid #0066cc;">
        <h3 style="color: #0066cc; margin: 0 0 10px 0;">Listen to Your Interview</h3>
        <p style="margin: 0;">
          <a href="${phoneScreen.recordingUrl}" 
             style="display: inline-block; padding: 10px 20px; background-color: #0066cc; color: white; text-decoration: none; border-radius: 6px; font-weight: 500;">
            🎧 Play Recording
          </a>
        </p>
      </div>

      <div style="margin: 25px 0; padding: 20px; background-color: ${performanceBg}; border-radius: 8px;">
        <h3 style="color: ${performanceColor}; margin: 0 0 10px 0;">Overall Performance: ${performanceLevel}</h3>
        <p style="margin: 0; color: ${performanceColor};">
          Average Score: ${averageScore.toFixed(1)}/100
        </p>
      </div>

      <div style="margin: 25px 0; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
        <h4 style="color: #2c3e50; margin: 0 0 10px 0;">How Scoring Works</h4>
        <p style="margin: 0; color: #34495e;">
          Each question is scored from 0 to 100, where 100 represents a perfect answer. Your overall performance is calculated as an average of these individual scores. A score above 80 is excellent, above 60 is good, and below 60 indicates areas for improvement.
        </p>
      </div>

      <h3 style="color: #2c3e50; margin: 30px 0 20px;">Detailed Feedback by Question</h3>
      ${formattedFeedback}

      <div style="margin-top: 30px; padding: 20px; background-color: #e9ecef; border-radius: 8px;">
        <h4 style="color: #2c3e50; margin: 0 0 10px 0;">What Happens Next?</h4>
        <p style="margin: 0;">
          ${averageScore >= 70 
            ? "Based on your performance score of 70 or above, we've forwarded your interview results to the hiring team. While we can't guarantee a response, we believe you've demonstrated strong potential for this role."
            : "Thank you for participating in this interview. To maintain high-quality candidate submissions, we only share interview results with companies for candidates who score 70 or above. We encourage you to review the feedback above and consider applying for other positions."}
        </p>
        <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #dee2e6;">
          <p style="margin: 0; font-size: 0.9em; color: #495057;">
            <strong>Note:</strong> To ensure fair consideration for all candidates, you may apply for one position per company every 30 days. However, you're welcome to apply for positions at other companies at any time.
          </p>
        </div>
      </div>
    </div>
  `;

  try {
    const emailParams = {
      from: "ashley@phonescreen.ai",
      to: toEmail,
      subject: `Your Phone Screen Results for ${job.jobTitle} at ${job.company}`,
      html: generateEmailTemplate({
        subject: `Your Phone Screen Results for ${job.jobTitle} at ${job.company}`,
        toEmail: toEmail,
        fromEmail: "ashley@phonescreen.ai",
        content: emailBody,
      }),
    };
    
    console.log(`${isLocalDev ? 'Sending development email to: ' + toEmail : 'Sending production email to: ' + candidate.email}`);
    await resend.emails.send(emailParams);

    // Track email sent event in PostHog
    const captureEvent = {
      api_key: process.env.NEXT_PUBLIC_POSTHOG_KEY,
      event: "Candidate Results Email Sent",
      distinct_id: candidate.id || 'anonymous',
      properties: {
        job_title: job.jobTitle,
        company: job.company,
        average_score: averageScore,
        qualification_score: phoneScreen.qualificationScore,
        results_shared: averageScore >= 70,
        email_type: "candidate_results",
        development_mode: isLocalDev,
        question_count: phoneScreen.analysisV2.length,
        $current_url: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
      },
      timestamp: new Date().toISOString()
    };

    await axios.post("https://app.posthog.com/capture/", captureEvent, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.NEXT_PUBLIC_POSTHOG_KEY}`
      },
    });
  } catch (error) {
    console.error('Error sending candidate feedback email:', error);
    throw error;
  }
}