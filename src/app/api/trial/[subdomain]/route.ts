import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mongodb";
import { getTrialToken } from "@/lib/tokens";

// GET trial toran details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const { subdomain } = await params;
    const trialToken = await getTrialToken();

    if (!trialToken) {
      return NextResponse.json(
        { error: "No trial session" },
        { status: 401 }
      );
    }

    const gateway = await db.collection("gateways").findOne({
      subdomain,
      trial_token: trialToken,
    });

    if (!gateway) {
      return NextResponse.json(
        { error: "Gateway not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      _id: gateway._id,
      subdomain: gateway.subdomain,
      upstreamBaseUrl: gateway.upstreamBaseUrl,
      cacheTtl: gateway.cacheTtl,
      logFilters: gateway.logFilters,
    });
  } catch (error) {
    console.error("Trial gateway fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT to update trial toran
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const { subdomain } = await params;
    const trialToken = await getTrialToken();

    if (!trialToken) {
      return NextResponse.json(
        { error: "No trial session" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { cacheTtl, logFilters } = body;

    const updateFields: Record<string, unknown> = {
      cacheTtl: cacheTtl ?? null,
      updatedAt: new Date(),
    };

    if (logFilters !== undefined) {
      updateFields.logFilters = logFilters;
    }

    const result = await db.collection("gateways").findOneAndUpdate(
      { subdomain, trial_token: trialToken },
      { $set: updateFields },
      { returnDocument: "after" }
    );

    if (!result) {
      return NextResponse.json(
        { error: "Gateway not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      _id: result._id,
      subdomain: result.subdomain,
      upstreamBaseUrl: result.upstreamBaseUrl,
      cacheTtl: result.cacheTtl,
      logFilters: result.logFilters,
    });
  } catch (error) {
    console.error("Trial gateway update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
