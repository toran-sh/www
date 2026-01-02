import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { db } from "@/lib/mongodb";
import { generateToken, getTrialToken, storeClaimToken } from "@/lib/tokens";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { email, subdomain } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    if (!subdomain || typeof subdomain !== "string") {
      return NextResponse.json(
        { error: "Subdomain is required" },
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

    // Get trial token from cookie
    const trialToken = await getTrialToken();
    if (!trialToken) {
      return NextResponse.json(
        { error: "No trial session found" },
        { status: 401 }
      );
    }

    // Verify the toran belongs to this trial session
    const gateway = await db.collection("gateways").findOne({
      subdomain,
      trial_token: trialToken,
    });

    if (!gateway) {
      return NextResponse.json(
        { error: "toran not found or doesn't belong to this session" },
        { status: 404 }
      );
    }

    // Generate claim token and store it
    const token = generateToken();
    await storeClaimToken(token, email, subdomain, trialToken);

    // Create claim link
    let baseUrl = process.env.APP_URL;
    if (!baseUrl) {
      const host = request.headers.get("host");
      const protocol = request.headers.get("x-forwarded-proto") || "https";
      baseUrl = `${protocol}://${host}`;
    }
    const claimLink = `${baseUrl}/api/auth/verify-claim?token=${token}`;

    // Send email
    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: email,
      subject: "Claim your toran",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
          </head>
          <body>
            <div>
              <p>Click the button below to claim your toran and create your account. This link will expire in 15 minutes.</p>
              <p>Your toran subdomain: <strong>${subdomain}</strong></p>
              <a href="${claimLink}">Claim your toran</a>
              <p>If the link above doesn't work, copy and paste the following URL into your browser:</p>
              <p style="word-break: break-all;">
                <a href="${claimLink}" style="color: #4f46e5;">${claimLink}</a>
              </p>
              <p>If you didn't request this email, you can safely ignore it.</p>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error("Failed to send claim email:", error);
      return NextResponse.json(
        { error: "Failed to send claim link" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending claim link:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
