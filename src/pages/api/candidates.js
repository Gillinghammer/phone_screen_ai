import { getPaginatedCandidates } from "@/lib/dataFetchers";

export default async function handler(req, res) {
  const { jobId, page, limit } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  try {
    const candidates = await getPaginatedCandidates(jobId, skip, parseInt(limit));
    res.status(200).json({ candidates });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch candidates" });
  }
}