import { prisma } from '../../../lib/prisma'
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { email, password, name, company, parentCompanyId } = req.body;
      
      console.log("Signup request body:", {
        email,
        name,
        company,
        parentCompanyId,
        hasParentCompanyId: !!parentCompanyId
      });

      // Check if parent company exists when parentCompanyId is provided
      if (parentCompanyId) {
        const parentCompany = await prisma.company.findUnique({
          where: { id: parseInt(parentCompanyId) },
        });

        if (!parentCompany) {
          return res.status(404).json({ message: "Parent company not found" });
        }
      }

      // Check if the user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: email },
      });

      if (existingUser) {
        return res.status(409).json({ message: "User already exists" });
      }

      // Check if the company already exists
      let companyRecord = await prisma.company.findUnique({
        where: { domain: email.split("@")[1] },
      });

      // If the company doesn't exist, create it
      if (!companyRecord) {
        const companyData = {
          name: company,
          domain: email.split("@")[1],
          parentCompanyId: parentCompanyId ? parseInt(parentCompanyId) : null,
        };

        console.log("Creating company with data:", companyData);

        companyRecord = await prisma.company.create({
          data: companyData,
        });
        
        console.log("Company created:", companyRecord);
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create the user with the correct role
      const user = await prisma.user.create({
        data: {
          email: email,
          password: hashedPassword,
          name: name,
          companyId: companyRecord.id,
          role: "MEMBER",
        },
      });

      console.log("User created", user);

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      return res.status(201).json({
        message: "User created",
        token: token,
        isWhiteLabel: !!parentCompanyId,
      });
    } catch (error) {
      console.error("Signup error:", error);
      return res
        .status(500)
        .json({ message: "Something went wrong", error: error.message });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}