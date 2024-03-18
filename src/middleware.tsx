import { NextResponse, NextRequest } from "next/server";
import { getToken, JWT } from "next-auth/jwt";

declare module "next/server" {
  interface NextRequest {
    nextauth?: { token: JWT }; // Use JWT type
  }
}

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (token) {
    // Attach the token to the request using the NextRequest object
    req.nextauth = { token };
  }

  return NextResponse.next();
}
