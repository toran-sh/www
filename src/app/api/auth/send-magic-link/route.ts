import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { generateToken, storeToken } from "@/lib/tokens";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Generate and store token
    const token = generateToken();
    await storeToken(token, email);

    // Create magic link - derive from request if APP_URL not set
    let baseUrl = process.env.APP_URL;
    if (!baseUrl) {
      const host = request.headers.get("host");
      const protocol = request.headers.get("x-forwarded-proto") || "https";
      baseUrl = `${protocol}://${host}`;
    }
    const magicLink = `${baseUrl}/api/auth/verify?token=${token}`;

    // Send email
    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: email,
      subject: "Sign in to toran",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
          </head>
          <body>
            <div>
            <p>Click the button below to sign in to your toran account. This link will expire in 15 minutes.</p>
            <a href="${magicLink}">Sign in to toran</a>
            <p>If the link above doesn't work, copy and paste the following URL into your browser:</p>
            <p style="word-break: break-all;">
              <a href="${magicLink}" style="color: #4f46e5;">${magicLink}</a>
            </p>
            <p>If you didn't request this email, you can safely ignore it.</p>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error("Failed to send email:", error);
      return NextResponse.json(
        { error: "Failed to send magic link" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending magic link:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
