// pages/api/pilot-application.js
import prisma from "../../lib/prisma";

export default async function handler(req, res) {
  if (req.method === "POST") {
    // Destructure and log the body to see if it's being received correctly
    const { company, firstName, lastName, email, weeklyApplicants } = req.body;
    console.log("Received data:", req.body);

    // Check if prisma client is defined
    if (!prisma) {
      console.error("Prisma client is not instantiated");
      return res.status(500).json({ error: "Prisma client is undefined" });
    }

    try {
      // Attempt to create a new applicant and log the result
      const newApplicant = await prisma.pilotProgramApplicant.create({
        data: {
          company,
          firstName,
          lastName,
          email,
          weeklyApplicants: Number(weeklyApplicants),
        },
      });
      console.log("New applicant created", newApplicant);
      return res.status(200).json(newApplicant);
    } catch (error) {
      console.error("Request error", error);
      return res.status(500).json({
        error: "Error creating applicant",
        errorMessage: error.message,
      });
    }
  } else {
    // Respond to non-POST methods
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }
}
