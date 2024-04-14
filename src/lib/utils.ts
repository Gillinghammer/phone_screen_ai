import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { Resend } from 'resend';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const resend = new Resend('re_bioD3dPE_qtnugC5zbSU2g3AP7HLDzuAt');

interface SendEmailParams {
  to: string;
  subject: string;
  text: string;
  html: string;
}
export async function sendEmail({ to, subject, text, html }: SendEmailParams): Promise<void> {
  try {
    const emailParams = {
      from: 'your-email@example.com',
      to,
      subject,
      text,
      html,
    };

    await resend.emails.send(emailParams);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}