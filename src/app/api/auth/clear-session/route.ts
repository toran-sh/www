import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const response = NextResponse.redirect(new URL("/login", request.url));

  // Clear the session cookie by setting it to expire immediately
  response.cookies.set("session", "", {
    expires: new Date(0),
    path: "/",
  });

  return response;
}
