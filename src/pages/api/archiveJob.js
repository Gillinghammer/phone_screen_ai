// pages/api/archiveJob.js

import prisma from "../../lib/prisma";

export default async function handler(req, res) {
  if (req.method === "PUT") {
    const { jobIds } = req.body;
    console.log("Archiving jobs:", jobIds);

    if (!jobIds || !Array.isArray(jobIds) || jobIds.length === 0) {
      return res
        .status(400)
        .json({ message: "Job IDs are required and must be an array" });
    }

    try {
      const result = await prisma.job.updateMany({
        where: { id: { in: jobIds } },
        data: { isArchived: true },
      });
      if (result.count > 0) {
        console.log("Jobs archived:", result);
        return res
          .status(200)
          .json({ message: `${result.count} job(s) archived successfully` });
      } else {
        console.error("No jobs found");
        return res.status(404).json({ message: "No jobs found" });
      }
    } catch (error) {
      console.error("Error archiving jobs:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  } else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}
