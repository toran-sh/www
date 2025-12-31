import { NextRequest, NextResponse } from "next/server";
import { verifyToken, createSession } from "@/lib/tokens";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.redirect(new URL("/login?error=missing_token", request.url));
    }

    const email = await verifyToken(token);

    if (!email) {
      return NextResponse.redirect(new URL("/login?error=invalid_token", request.url));
    }

    // Create session
    await createSession(email);

    // Redirect to dashboard
    return NextResponse.redirect(new URL("/dashboard", request.url));
  } catch (error) {
    console.error("Error during verification:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
