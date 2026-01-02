import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mongodb";
import { getSession, getTrialToken, clearTrialToken } from "@/lib/tokens";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const subdomain = searchParams.get("subdomain");

  if (!subdomain) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const userId = await getSession();
  const trialToken = await getTrialToken();

  if (!userId) {
    // Not logged in, redirect to try page
    return NextResponse.redirect(new URL(`/try/${subdomain}`, request.url));
  }

  // If they have a trial token, auto-link all trial torans
  if (trialToken) {
    await db.collection("gateways").updateMany(
      { trial_token: trialToken },
      {
        $set: {
          user_id: userId,
          trial_token: null,
          updatedAt: new Date(),
        },
      }
    );

    // Clear the trial token cookie
    await clearTrialToken();
  }

  // Check if this toran belongs to the user
  const userGateway = await db.collection("gateways").findOne({
    subdomain,
    user_id: userId,
  });

  if (userGateway) {
    return NextResponse.redirect(new URL(`/toran/${subdomain}`, request.url));
  }

  // Toran doesn't belong to user, redirect to dashboard
  return NextResponse.redirect(new URL("/dashboard", request.url));
}
