import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mongodb";
import { DEFAULT_LOG_FILTERS } from "@/lib/log-filters";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const { subdomain } = await params;

    if (!subdomain) {
      return NextResponse.json(
        { error: "Subdomain is required" },
        { status: 400 }
      );
    }

    const gateway = await db.collection("gateways").findOne({ subdomain });

    if (!gateway) {
      return NextResponse.json(
        { error: "Gateway not found" },
        { status: 404 }
      );
    }

    // Determine max body size based on plan (TODO: implement plan-based sizing)
    // For now: 100KB default, can be expanded later
    const maxResponseBodySize = 102400;

    return NextResponse.json(
      {
        upstreamBaseUrl: gateway.upstreamBaseUrl,
        cacheTtl: gateway.cacheTtl,
        logFilters: gateway.logFilters ?? DEFAULT_LOG_FILTERS,
        logResponseBody: gateway.logResponseBody ?? false,
        maxResponseBodySize,
      },
      {
        headers: {
          "Cache-Control": "public, max-age=60",
        },
      }
    );
  } catch (error) {
    console.error("Configuration fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
