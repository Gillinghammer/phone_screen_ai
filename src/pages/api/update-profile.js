// pages/api/updateProfile.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { PrismaClient } from "@prisma/client";
import { getToken } from "next-auth/jwt";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  console.log("req.method", req.method);
  console.log("req.body", req.body);

  // Ensure this API route only accepts PUT requests
  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  // Get the user's session to confirm they are authenticated
  const session = await getServerSession(req, res, authOptions);
  const token = await getToken({ req });

  if (!session || !token.id) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  // Get the updated profile data from the request body
  const { name, email, companyName, companyId } = req.body;

  try {
    // Update the user's profile in the database
    const user = await prisma.user.update({
      where: { id: token.id },
      data: {
        name,
        email,
        company: {
          connect: {
            id: companyId,
          },
          update: {
            name: companyName,
          },
        },
      },
      include: { company: true },
    });

    // Respond with the updated user profile
    return res.status(200).json(user);
  } catch (error) {
    console.error("Failed to update profile", error);
    return res.status(500).json({ message: "Failed to update profile" });
  }
}
