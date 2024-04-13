// pages/api/changeCandidateStatus.js

import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  if (req.method === "PUT") {
    const { candidateIds, status } = req.body;
    console.log("Changing candidate status:", candidateIds, status);

    if (!candidateIds || !status) {
      return res
        .status(400)
        .json({ message: "Candidate IDs and status are required" });
    }

    const validStatuses = ["ACCEPTED", "REJECTED", "ARCHIVED", "OPEN"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    try {
      const updatedCandidates = await prisma.candidate.updateMany({
        where: { id: { in: candidateIds } },
        data: { status },
      });

      if (updatedCandidates.count > 0) {
        console.log("Candidate statuses changed:", updatedCandidates);
        return res.status(200).json({
          message: `${updatedCandidates.count} candidate(s) status updated successfully`,
        });
      } else {
        console.error("No candidates found");
        return res.status(404).json({ message: "No candidates found" });
      }
    } catch (error) {
      console.error("Error changing candidate statuses:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  } else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}
