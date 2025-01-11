import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { Resend } from 'resend';

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