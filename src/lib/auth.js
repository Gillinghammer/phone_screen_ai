// lib/auth.js
import { generateResetToken, sendEmail } from "@/lib/utils";

export async function sendPasswordResetEmail(email) {
  const resetToken = generateResetToken();

  // Store the reset token securely in your database, associated with the user's email

  const resetLink = `${process.env.NEXT_PUBLIC_API_URL}/reset-password?token=${resetToken}`;

  await sendEmail({
    to: email,
    subject: "Password Reset",
    text: `Click the following link to reset your password: ${resetLink}`,
    html: `<p>Click the following link to reset your password: <a href="${resetLink}">${resetLink}</a></p>`,
  });
}

// lib/auth.js
export async function resetPassword(token, password) {
  const response = await fetch("/api/reset-password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token, password }),
  });

  if (!response.ok) {
    throw new Error("Failed to reset password");
  }
}
