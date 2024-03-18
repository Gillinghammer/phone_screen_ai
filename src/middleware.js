import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (token) {
    // Attach the token to the request using the NextRequest object
    req.nextauth = { token };
  }

  return NextResponse.next();
}
