import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { Resend } from 'resend';

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
  // console.log('Sending email:', { to, subject, html });
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
 * Filter and sort candidates based on search term, status, and sort criteria
 * @param {Array} candidates
 * @param {string} searchTerm
 * @param {string} selectedStatus
 * @param {string} sortColumn
 * @param {string} sortOrder
 * @returns {Array}
 */
// Remove or comment out the getFilteredCandidates function, as filtering and sorting will be handled on the server-side
// export function getFilteredCandidates(candidates, searchTerm, selectedStatus, sortColumn, sortOrder) {
//   return candidates
//     .filter((candidate) => {
//       const matchesSearch = 
//         candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         candidate.phone.includes(searchTerm);
      
//       const matchesStatus = selectedStatus === 'any' || candidate.status === selectedStatus;
      
//       return matchesSearch && matchesStatus;
//     })
//     .sort((a, b) => {
//       let comparison = 0;
//       if (sortColumn === 'name') {
//         comparison = a.name.localeCompare(b.name);
//       } else if (sortColumn === 'status') {
//         comparison = a.status.localeCompare(b.status);
//       } else if (sortColumn === 'screened') {
//         comparison = (a.phoneScreen ? 1 : 0) - (b.phoneScreen ? 1 : 0);
//       }
//       return sortOrder === 'asc' ? comparison : -comparison;
//     });
// }

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

export async function performBulkAction(job, action, candidateIds) {
  // Map the action to the correct status value
  const statusMap = {
    ACCEPT: 'ACCEPTED',
    REJECT: 'REJECTED',
    ARCHIVE: 'ARCHIVED',
    RESET: 'OPEN'
  };

  const status = statusMap[action] || action;

  const response = await fetch('/api/changeCandidateStatus', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ candidateIds, status, job }),
  });

  if (!response.ok) {
    throw new Error('Failed to perform bulk action');
  }

  return await response.json();
}