import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mongodb";
import {
  verifyClaimToken,
  createSession,
  clearTrialToken,
  findOrCreateUser,
} from "@/lib/tokens";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.redirect(new URL("/login?error=missing_token", request.url));
    }

    // Verify the claim token and get claim info
    const claimInfo = await verifyClaimToken(token);

    if (!claimInfo) {
      return NextResponse.redirect(new URL("/login?error=invalid_token", request.url));
    }

    const { email, subdomain, trialToken } = claimInfo;

    // Find the toran with matching subdomain and trial_token
    const gateway = await db.collection("gateways").findOne({
      subdomain,
      trial_token: trialToken,
    });

    if (!gateway) {
      return NextResponse.redirect(new URL("/login?error=toran_not_found", request.url));
    }

    // Find or create user
    const userId = await findOrCreateUser(email);

    // Update the toran to link it to the user
    await db.collection("gateways").updateOne(
      { _id: gateway._id },
      {
        $set: {
          user_id: userId,
          trial_token: null,
          updatedAt: new Date(),
        },
      }
    );

    // Create session for the user
    await createSession(email);

    // Clear trial token cookie
    await clearTrialToken();

    // Redirect to the toran's logs page
    return NextResponse.redirect(new URL(`/dashboard/${subdomain}/logs`, request.url));
  } catch (error) {
    console.error("Error during claim verification:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
