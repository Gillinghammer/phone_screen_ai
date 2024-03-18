import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { candidate_id } = req.query;

  if (req.method === 'PUT') {
    try {
      const { status } = req.body;

      // Validate the status
      const validStatuses = ['OPEN', 'ACCEPTED', 'REJECTED', 'ARCHIVED'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status value' });
      }

      // Update the candidate's status
      const updatedCandidate = await prisma.candidate.update({
        where: { id: parseInt(candidate_id) },
        data: { status },
      });

      return res.status(200).json(updatedCandidate);
    } catch (error) {
      console.error('Request error:', error);
      res.status(500).json({ error: 'Error updating candidate status' });
    }
  } else {
    // Handle any requests other than PUT
    res.setHeader('Allow', ['PUT']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
