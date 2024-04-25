import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { track } from "@vercel/analytics";
const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { email, password, name, company } = req.body;

      // Check if the user already exists
      const existingUser = await prisma.user.findUnique({
        where: {
          email: email,
        },
      });

      if (existingUser) {
        return res.status(409).json({ message: "User already exists" });
      }

      // Check if the company already exists
      let companyRecord = await prisma.company.findUnique({
        where: {
          domain: email.split("@")[1],
        },
      });

      // If the company doesn't exist, create it
      if (!companyRecord) {
        companyRecord = await prisma.company.create({
          data: {
            name: company,
            domain: email.split("@")[1],
          },
        });
        console.log("Company created", companyRecord);
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create the user and associate with the company
      const user = await prisma.user.create({
        data: {
          email: email,
          password: hashedPassword,
          name: name,
          companyId: companyRecord.id,
        },
      });

      console.log("User created", user);

      // Track the user signup event
      track("User signup", {
        email: user.email,
        name: user.name,
        company: companyRecord.name,
        domain: companyRecord.domain,
      });

      return res.status(201).json({
        message: "User created",
        user: { id: user.id, email: user.email, name: user.name },
      });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Something went wrong", error: error.message });
    }
  } else {
    // Handle any other HTTP method
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
