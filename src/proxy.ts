import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function proxy(request: NextRequest) {
  const sessionCookie = request.cookies.get("session");
  const { pathname } = request.nextUrl;

  // Protect dashboard and toran routes - redirect to login if no cookie
  // Note: We only check cookie existence here, not validity
  // The page will validate the session and handle invalid sessions
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/toran")) {
    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Initialize trial token on /try page to prevent race conditions
  // when creating torans in multiple tabs
  if (pathname === "/try") {
    const existingToken = request.cookies.get("trial_session")?.value;

    if (!existingToken) {
      const response = NextResponse.next();
      const token = generateToken();

      response.cookies.set("trial_session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60, // 7 days
      });

      return response;
    }
  }

  // Don't redirect from login based on cookie - the cookie might be invalid
  // Let the login page handle already-logged-in users if needed

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/toran/:path*", "/try"],
};
