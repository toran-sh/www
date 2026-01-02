import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { db } from "@/lib/mongodb";
import { getTrialToken } from "@/lib/tokens";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const trialToken = await getTrialToken();
    if (!trialToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { subdomain } = await params;
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));
    const since = searchParams.get("since"); // Last log ID for streaming

    // Verify gateway belongs to this trial session
    const gateway = await db.collection("gateways").findOne({
      subdomain,
      trial_token: trialToken,
    });

    if (!gateway) {
      return NextResponse.json({ error: "toran not found" }, { status: 404 });
    }

    // If streaming (since provided), only get new logs after that ID
    if (since) {
      try {
        const sinceId = new ObjectId(since);
        const newLogs = await db
          .collection("logs")
          .find({
            subdomain,
            _id: { $gt: sinceId },
          })
          .sort({ createdAt: -1 })
          .limit(100) // Cap at 100 new logs per poll
          .project({
            _id: 1,
            timestamp: 1,
            request: { method: 1, path: 1, query: 1 },
            response: { status: 1, bodySize: 1 },
            duration: 1,
            upstreamMetrics: 1,
            cacheStatus: 1,
            createdAt: 1,
          })
          .toArray();

        return NextResponse.json({ logs: newLogs, isStreaming: true });
      } catch {
        // Invalid ObjectId, fall through to normal pagination
      }
    }

    const skip = (page - 1) * limit;

    // Get total count
    const total = await db.collection("logs").countDocuments({ subdomain });

    // Get paginated logs
    const logs = await db
      .collection("logs")
      .find({ subdomain })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .project({
        _id: 1,
        timestamp: 1,
        request: { method: 1, path: 1, query: 1 },
        response: { status: 1, bodySize: 1 },
        duration: 1,
        upstreamMetrics: 1,
        cacheStatus: 1,
        createdAt: 1,
      })
      .toArray();

    return NextResponse.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Trial logs fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
