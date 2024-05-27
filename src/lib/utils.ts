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
  html: string;
}
export async function sendEmail({to, subject, html }: SendEmailParams): Promise<void> {
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