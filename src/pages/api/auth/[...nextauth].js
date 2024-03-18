// pages/api/auth/[...nextauth].js
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs"; // Make sure to install bcryptjs if you haven't

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

          if (user && bcrypt.compareSync(credentials.password, user.password)) {
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
      console.log("JWT callback - User:", user);
      console.log("JWT callback - Token before:", token);
      if (user) {
        token.id = user.id;
      } else if (!token.id && token.sub) {
        token.id = token.sub;
      }
      console.log("JWT callback - Token after:", token);
      return token;
    },
    async session({ session, token }) {
      console.log("Session callback - Token:", token);
      console.log("Session callback - Session before:", session);
      session.user = { ...session.user, id: token.id };
      console.log("Session callback - Session after:", session);
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
    newUser: null,
  },
});
