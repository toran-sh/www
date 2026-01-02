import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const sessionCookie = request.cookies.get("session");
  const { pathname } = request.nextUrl;

  // Protect dashboard routes - redirect to login if no cookie
  // Note: We only check cookie existence here, not validity
  // The page will validate the session and handle invalid sessions
  if (pathname.startsWith("/dashboard")) {
    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Don't redirect from login based on cookie - the cookie might be invalid
  // Let the login page handle already-logged-in users if needed

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
