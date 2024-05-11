import { PrismaClient } from "@prisma/client";
import { sendEmail } from "../../../lib/utils";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { email } = req.body;

    try {
      // Find the user by email
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Generate a unique password reset token
      const resetToken = Math.random().toString(36).substring(7);

      // Store the reset token and its expiration time in the database
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken,
          resetTokenExpires: new Date(Date.now() + 3600000), // Token expires in 1 hour
        },
      });

      // Send the password reset email
      const resetUrl = `${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password?token=${resetToken}`;
      await sendEmail({
        to: email,
        subject: "Password Reset",
        text: `Click the following link to reset your password: ${resetUrl}`,
        html: `<p>Click <a href="${resetUrl}">here</a> to reset your password.</p>`,
      });

      return res.status(200).json({ message: "Password reset email sent" });
    } catch (error) {
      console.error("Password reset error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  } else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}
