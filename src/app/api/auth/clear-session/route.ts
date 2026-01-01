import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL("/login", request.url);
  const response = NextResponse.redirect(url, { status: 302 });

  // Prevent caching of this redirect
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  response.headers.set("Pragma", "no-cache");

  // Clear the session cookie
  response.cookies.delete("session");

  return response;
}
