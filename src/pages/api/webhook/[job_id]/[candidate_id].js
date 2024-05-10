import { PrismaClient } from "@prisma/client";
import axios from "axios";
import { sendEmail } from "../../../../lib/utils";
const prisma = new PrismaClient();

export default async function webhook(req, res) {
  if (req.method === "POST") {
    // Extract the job_id and candidate_id from the query parameters
    const { job_id, candidate_id } = req.query;
    console.log("webhook debug ", req.body);
    // Extract the data from the request body
    const {
      call_id,
      call_length,
      to,
      from,
      completed,
      created_at,
      variables,
      recording_url,
      batch_id,
      wait,
      language,
      inbound,
      queue_status,
      endpoint_url,
      max_duration,
      error_message,
      answered_by,
      record,
      concatenated_transcript,
      transcripts,
      status,
      corrected_duration,
      end_at,
      price,
    } = req.body;

    // Store or update the data in the database
    try {
      const phoneScreen = await prisma.phoneScreen.upsert({
        where: {
          candidateId: parseInt(candidate_id),
        },
        update: {
          callId: call_id,
          callLength: call_length,
          to,
          from,
          batchId: batch_id,
          wait,
          language,
          completed,
          inbound,
          queueStatus: queue_status,
          endpointUrl: endpoint_url,
          maxDuration: max_duration,
          errorMessage: error_message,
          variables: JSON.stringify(variables),
          answeredBy: answered_by,
          record,
          recordingUrl: recording_url,
          concatenatedTranscript: concatenated_transcript,
          transcripts: JSON.stringify(transcripts),
          status,
          correctedDuration: parseInt(corrected_duration),
          endAt: new Date(end_at),
          price,
          qualificationScore: parseFloat(price), // Assuming qualificationScore comes from 'price', update accordingly
        },
        create: {
          jobId: parseInt(job_id),
          candidateId: parseInt(candidate_id),
          callId: call_id,
          callLength: call_length,
          to,
          from,
          batchId: batch_id,
          wait,
          language,
          completed,
          createdAt: new Date(created_at),
          inbound,
          queueStatus: queue_status,
          endpointUrl: endpoint_url,
          maxDuration: max_duration,
          errorMessage: error_message,
          variables: JSON.stringify(variables),
          answeredBy: answered_by,
          record,
          recordingUrl: recording_url,
          concatenatedTranscript: concatenated_transcript,
          transcripts: JSON.stringify(transcripts),
          status,
          correctedDuration: parseInt(corrected_duration),
          endAt: new Date(end_at),
          price,
          qualificationScore: parseFloat(price), // Assuming qualificationScore comes from 'price', update accordingly
        },
      });

      // Call the analyze-call API route with the necessary details
      const analyzeResponse = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v2/analyze-call`,
        {
          jobId: job_id,
          callId: call_id,
          phoneScreenId: phoneScreen.id,
        }
      );

      // Send email to candidate (alias) function sendEmail({ to, subject, text, html }: SendEmailParams):
      await sendEmail({
        to: variables.candidateEmail,
        subject: "📞Thank you for completing the phone screen",
        html: `<!DOCTYPE html>
              <html lang="en">
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
              </head>
              <body>
                <p>Hi ${variables.candidateName},</p>
                <p>Thank you for taking the time to complete the phone screen for the ${variables.job_title} position.</p>
                
                <p>We've shared your responses with the hiring team. If you're shortlisted for the role the team will be in touch with next steps.</p>
                
                <p>Best regards,<br>
                PhoneScreen.AI Team</p>
              </body>
              </html>`,
      });

      // Send a response back to acknowledge receipt of the data
      res.status(200).json({
        message: "Webhook data received and stored successfully",
        analyzeResponse: analyzeResponse.data,
      });
    } catch (error) {
      console.error("Error storing webhook data:", error);
      res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }
  } else {
    // If the request method is not POST, return a 405 Method Not Allowed error
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
