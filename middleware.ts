import { NextRequest, NextResponse } from "next/server";
import { verifyJWTToken } from "./lib/auth";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  if (!token) return NextResponse.redirect(new URL("/login", req.url));

  try {
    await verifyJWTToken(token);
    return NextResponse.next();
  } catch (e) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/agents/:path*"], // protect routes under /dashboard
};
