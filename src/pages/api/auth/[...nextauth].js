// pages/api/auth/[...nextauth].js
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from '../../../lib/prisma';
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';

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
      } else if (!token.id && token.sub) {
        token.id = token.sub;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = { ...session.user, id: token.id };
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
    newUser: null,
    resetPassword: "/auth/reset-password",
  },
});