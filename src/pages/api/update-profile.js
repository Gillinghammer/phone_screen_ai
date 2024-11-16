// pages/api/updateProfile.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { prisma } from '../../lib/prisma';
import { getToken } from "next-auth/jwt";

export default async function handler(req, res) {
  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  const token = await getToken({ req });

  if (!session || !token.id) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  const { name, email, companyName, companyId, webhookUrl } = req.body;

  try {
    // Update user information
    const updatedUser = await prisma.user.update({
      where: { id: token.id },
      data: {
        name,
        email,
      },
    });

    // Update company information
    const updatedCompany = await prisma.company.update({
      where: { id: companyId },
      data: {
        name: companyName,
        webhookUrl,
      },
    });

    return res.status(200).json({ user: updatedUser, company: updatedCompany });
  } catch (error) {
    console.error("Failed to update profile", error);
    return res.status(500).json({ message: "Failed to update profile", error: error.message });
  }
}
