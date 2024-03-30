// pages/api/archiveJob.js

import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  if (req.method === "PUT") {
    const { jobId } = req.body;
    console.log("Archiving job:", jobId);

    if (!jobId) {
      return res.status(400).json({ message: "Job ID is required" });
    }

    try {
      const result = await prisma.job.update({
        where: { id: jobId },
        data: { isArchived: true },
      });
      if (result) {
        console.log("Job archived:", result);
        return res.status(200).json({ message: "Job archived successfully" });
      } else {
        console.error("Job not found");
        return res.status(404).json({ message: "Job not found" });
      }
    } catch (error) {
      console.error("Error archiving job:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  } else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}
