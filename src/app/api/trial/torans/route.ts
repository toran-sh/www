import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mongodb";
import { generateToken, getTrialToken, setTrialTokenCookie } from "@/lib/tokens";
import { generateSubdomain } from "@/lib/subdomain";
import { DEFAULT_LOG_FILTERS } from "@/lib/log-filters";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { upstreamBaseUrl, cacheTtl } = body;

    if (!upstreamBaseUrl) {
      return NextResponse.json(
        { error: "Upstream base URL is required" },
        { status: 400 }
      );
    }

    // Get or generate trial token
    let trialToken = await getTrialToken();
    if (!trialToken) {
      trialToken = generateToken();
    }

    // Generate unique subdomain
    let subdomain = generateSubdomain();
    let exists = await db.collection("gateways").findOne({ subdomain });
    while (exists) {
      subdomain = generateSubdomain();
      exists = await db.collection("gateways").findOne({ subdomain });
    }

    const gateway = {
      subdomain,
      upstreamBaseUrl,
      cacheTtl: cacheTtl ?? null,
      logFilters: DEFAULT_LOG_FILTERS,
      user_id: null, // No user yet - trial toran
      trial_token: trialToken,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("gateways").insertOne(gateway);

    // Set trial token cookie
    await setTrialTokenCookie(trialToken);

    return NextResponse.json({
      ...gateway,
      _id: result.insertedId,
    });
  } catch (error) {
    console.error("Trial toran create error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
