require('dotenv').config();
const { Resend } = require('resend');
const resend = new Resend(process.env.NEXT_PUBLIC_RESEND_API_KEY);

// Import mock data
const mockJob = {
  id: 'test-job-id',
  jobTitle: 'Senior Software Engineer',
  companyName: 'Test Company'
};

const mockCandidate = {
  id: 'test-candidate-id',
  name: 'John Doe',
  email: 'colin+candidate@phonescreen.ai',
  hiringManagerEmail: 'colin+manager@phonescreen.ai',
  phone: '+1 (555) 123-4567',
  linkedinUrl: 'https://linkedin.com/in/johndoe'
};

const mockPhoneScreen = {
  id: 'test-screen-id',
  concatenatedTranscript: `
assistant: Hi, I'm Ashley from PhoneScreen.AI. How are you today?
user: I'm doing great, thanks for asking!
assistant: Let's discuss your experience with React development.
user: I've been working with React for 5 years, building complex web applications.`,
  recordingUrl: 'https://example.com/mock-recording.mp3',
  analysisV2: [
    {
      question: 'Tell me about your experience with React',
      answer: 'I have 5 years of experience building complex web applications with React',
      score: 85,
      reasoning: 'Strong experience demonstrated with specific timeline and project types mentioned.'
    },
    {
      question: 'What is your preferred state management solution?',
      answer: 'I prefer Redux for large applications and React Context for simpler state management needs',
      score: 90,
      reasoning: 'Shows good understanding of different state management approaches and when to use them.'
    }
  ]
};

// Email template generator
function generateEmailTemplate({ subject, toEmail, fromEmail, content }) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${subject}</title>
      </head>
      <body>
        ${content}
      </body>
    </html>
  `;
}

async function sendEmailHiringManager(phoneScreen, job, candidate) {
  if (!candidate.hiringManagerEmail) {
    console.log('No hiring manager email found for candidate:', candidate.id);
    return;
  }

  const isLocalDev = true; // Force local dev mode
  
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

      <div style="margin: 25px 0; padding: 20px; background-color: #f0f4f8; border-radius: 8px; border-left: 4px solid #0066cc;">
        <h3 style="color: #0066cc; margin: 0 0 15px 0;">Candidate Details</h3>
        <ul style="list-style-type: none; padding-left: 0; margin: 0;">
          <li style="margin-bottom: 8px;">📧 Email: ${candidate.email}</li>
          <li style="margin-bottom: 8px;">📞 Phone: ${candidate.phone}</li>
          ${candidate.linkedinUrl ? `<li>🔗 LinkedIn: <a href="${candidate.linkedinUrl}" style="color: #0066cc; text-decoration: none;">${candidate.linkedinUrl}</a></li>` : ''}
        </ul>
      </div>

      <div style="margin: 25px 0; padding: 20px; background-color: #f0f4f8; border-radius: 8px; border-left: 4px solid #0066cc;">
        <h3 style="color: #0066cc; margin: 0 0 10px 0;">Interview Recording</h3>
        <p style="margin: 0;">
          <a href="${phoneScreen.recordingUrl}" 
             style="display: inline-block; padding: 10px 20px; background-color: #0066cc; color: white; text-decoration: none; border-radius: 6px; font-weight: 500;">
            🎧 Listen to Recording
          </a>
        </p>
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
      subject: `${job.jobTitle} at ${job.companyName} | Pre qualified candidate ready to go!`,
      html: generateEmailTemplate({
        subject: `${job.jobTitle} at ${job.companyName} | Pre qualified candidate ready to go!`,
        toEmail: toEmail,
        fromEmail: "ashley@phonescreen.ai",
        content: emailBody,
      }),
    };
    
    console.log(`Sending development email to: ${toEmail}`);
    await resend.emails.send(emailParams);
  } catch (error) {
    console.error('Error sending hiring manager email:', error);
  }
}

async function sendEmailCandidate(phoneScreen, job, candidate) {
  if (!candidate.email) {
    console.log('No candidate email found:', candidate.id);
    return;
  }

  const isLocalDev = true; // Force local dev mode
  
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
        <h3 style="color: #0066cc; margin: 0 0 15px 0;">Listen to Your Interview</h3>
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
          ${averageScore >= 50 
            ? "Based on your performance score of 50 or above, we've forwarded your interview results to the hiring team. They will review your application and contact you if they wish to proceed with next steps."
            : "Thank you for participating in this phone screen. While we appreciate your time, based on your performance score we do not recommend proceeding with your application at this time."}
        </p>
      </div>
    </div>
  `;

  try {
    const emailParams = {
      from: "ashley@phonescreen.ai",
      to: toEmail,
      subject: `Your Phone Screen Results for ${job.jobTitle} at ${job.companyName}`,
      html: generateEmailTemplate({
        subject: `Your Phone Screen Results for ${job.jobTitle} at ${job.companyName}`,
        toEmail: toEmail,
        fromEmail: "ashley@phonescreen.ai",
        content: emailBody,
      }),
    };
    
    console.log(`Sending development email to: ${toEmail}`);
    await resend.emails.send(emailParams);
  } catch (error) {
    console.error('Error sending candidate email:', error);
  }
}

async function testEmails() {
  try {
    console.log('Sending test email to hiring manager...');
    await sendEmailHiringManager(mockPhoneScreen, mockJob, mockCandidate);
    
    console.log('Sending test email to candidate...');
    await sendEmailCandidate(mockPhoneScreen, mockJob, mockCandidate);
    
    console.log('Test emails sent successfully!');
  } catch (error) {
    console.error('Error sending test emails:', error);
  }
}

// Run the test
testEmails();
