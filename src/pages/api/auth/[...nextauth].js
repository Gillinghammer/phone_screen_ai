// pages/api/auth/[...nextauth].js
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs"; // Make sure to install bcryptjs if you haven't
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user) return null;

          // Check if the password is a token (for first login after signup)
          try {
            const decoded = jwt.verify(credentials.password, process.env.JWT_SECRET);
            if (decoded.email === user.email) {
              return { id: user.id, name: user.name, email: user.email };
            }
          } catch (error) {
            // If it's not a valid token, proceed with normal password check
          }

          if (bcrypt.compareSync(credentials.password, user.password)) {
            return { id: user.id, name: user.name, email: user.email };
          }
        } catch (error) {
          console.error("Authentication error:", error);
        }
        return null;
      },
    }),
  ],
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        const userWithCompany = await prisma.user.findUnique({
          where: { id: user.id },
          include: {
            company: {
              select: {
                id: true,
                name: true,
                whitelabel_logo: true,
                domain: true,
                parentCompanyId: true
              }
            }
          }
        });
        
        console.log('Raw company data:', userWithCompany?.company);
        
        if (userWithCompany?.company) {
          let companyData = { ...userWithCompany.company };
          
          // If there's a parent company, fetch its logo
          if (companyData.parentCompanyId) {
            const parentCompany = await prisma.company.findUnique({
              where: { id: companyData.parentCompanyId },
              select: { whitelabel_logo: true }
            });
            
            // Use parent logo if it exists, otherwise keep the company's own logo
            if (parentCompany?.whitelabel_logo) {
              companyData.whitelabel_logo = parentCompany.whitelabel_logo;
            }
          }
          
          token.company = companyData;
        } else {
          token.company = null;
        }
      } else if (!token.id && token.sub) {
        token.id = token.sub;
      }
      return token;
    },
    async session({ session, token }) {
      console.log('Debug - Token company:', token.company);
      
      session.user = { 
        ...session.user, 
        id: token.id,
        company: token.company
      };
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
    newUser: null,
    resetPassword: "/auth/reset-password", // Add this line
  },
});

// You can run this in a separate API endpoint temporarily
const company = await prisma.company.findUnique({
  where: { id: 37 },
  select: {
    id: true,
    name: true,
    whitelabel_logo: true
  }
});
console.log('Direct company query:', company);