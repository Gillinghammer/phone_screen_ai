import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { Resend } from 'resend';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const resend = new Resend(process.env.NEXT_PUBLIC_RESEND_API_KEY);

interface SendEmailParams {
  to: string;
  subject: string;
  text: string;
  html: string;
}
export async function sendEmail({ to, subject, text, html }: SendEmailParams): Promise<void> {
  try {
    const emailParams = {
      from: 'no-reply@phonescreen.ai',
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