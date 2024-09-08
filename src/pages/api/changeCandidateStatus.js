// pages/api/changeCandidateStatus.js

import prisma from "../../lib/prisma";
import axios from "axios";

export default async function handler(req, res) {
  if (req.method === "PUT") {
    const { candidateIds, status, job } = req.body;
    console.log("Changing candidate status:", candidateIds, status);

    if (!candidateIds || !status || !job) {
      return res
        .status(400)
        .json({ message: "Candidate IDs, status, and job are required" });
    }

    const validStatuses = ["ACCEPTED", "REJECTED", "ARCHIVED", "OPEN"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    try {
      // Convert candidateIds to integers
      const intCandidateIds = candidateIds.map(id => parseInt(id, 10));

      const updatedCandidates = await prisma.candidate.updateMany({
        where: {
          id: { in: intCandidateIds },
          jobPost: { id: job.id } // Use jobPost.id instead of jobId
        },
        data: { status },
      });

      if (updatedCandidates.count > 0) {
        console.log("Candidate statuses changed:", updatedCandidates);

        // Submit events to PostHog
        for (const candidateId of intCandidateIds) {
          const captureEvent = {
            api_key: process.env.NEXT_PUBLIC_POSTHOG_KEY,
            distinct_id: job.userId,
            event: "Candidate Status Changed",
            properties: {
              status: status,
              title: job.jobTitle,
              bulk_action: intCandidateIds.length > 1,
            },
          };

          try {
            await axios.post("https://app.posthog.com/capture/", captureEvent, {
              headers: {
                "Content-Type": "application/json",
              },
            });
          } catch (err) {
            console.error("PostHog had an error!", err);
            console.error(
              "PostHog had an error: ",
              err?.response?.data || "Unknown"
            );
          }
        }

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
