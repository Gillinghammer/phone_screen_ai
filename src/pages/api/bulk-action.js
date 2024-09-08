import { getSession } from "next-auth/react";
import prisma from "@/lib/prisma";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { jobId, action, candidateIds } = req.body;

  try {
    const updatedCandidates = await prisma.candidate.updateMany({
      where: {
        id: { in: candidateIds },
        jobId: jobId,
      },
      data: {
        status: action,
      },
    });

    res.status(200).json({ message: 'Bulk action completed successfully', updatedCount: updatedCandidates.count });
  } catch (error) {
    console.error('Error performing bulk action:', error);
    res.status(500).json({ message: 'Error performing bulk action' });
  }
}