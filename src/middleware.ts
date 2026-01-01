import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only check dashboard routes
  if (!pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get("session");

  // If no session cookie, redirect to login
  if (!sessionCookie?.value) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Session cookie exists - let the page validate it
  // If invalid, the page will call the clear-session API
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
