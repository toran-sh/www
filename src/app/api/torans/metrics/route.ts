import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mongodb";
import { getSession } from "@/lib/tokens";

export async function GET(request: NextRequest) {
  try {
    const userId = await getSession();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "hour";

    // Get all user's gateways
    const gateways = await db
      .collection("gateways")
      .find({ user_id: userId })
      .toArray();

    const subdomains = gateways.map((g) => g.subdomain);

    if (subdomains.length === 0) {
      return NextResponse.json({
        summary: {
          totalCalls: 0,
          cacheHits: 0,
          cacheMisses: 0,
          avgDuration: 0,
        },
        timeSeries: [],
      });
    }

    // Calculate time range
    const now = new Date();
    let startTime: Date;
    let truncUnit: "minute" | "hour";

    if (range === "day") {
      startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      truncUnit = "hour";
    } else {
      startTime = new Date(now.getTime() - 60 * 60 * 1000);
      truncUnit = "minute";
    }

    // Aggregate metrics across all user's torans
    const pipeline = [
      {
        $match: {
          subdomain: { $in: subdomains },
          createdAt: { $gte: startTime },
        },
      },
      {
        $group: {
          _id: {
            $dateTrunc: {
              date: "$createdAt",
              unit: truncUnit,
            },
          },
          calls: { $sum: 1 },
          cacheHits: {
            $sum: { $cond: [{ $eq: ["$cacheStatus", "HIT"] }, 1, 0] },
          },
          cacheMisses: {
            $sum: { $cond: [{ $eq: ["$cacheStatus", "MISS"] }, 1, 0] },
          },
          totalDuration: { $sum: "$duration" },
        },
      },
      {
        $sort: { _id: 1 as const },
      },
      {
        $project: {
          _id: 0,
          timestamp: "$_id",
          calls: 1,
          cacheHits: 1,
          cacheMisses: 1,
          avgDuration: {
            $cond: [
              { $gt: ["$calls", 0] },
              { $round: [{ $divide: ["$totalDuration", "$calls"] }, 0] },
              0,
            ],
          },
        },
      },
    ];

    const timeSeries = await db
      .collection("logs")
      .aggregate(pipeline)
      .toArray();

    // Calculate summary
    const summary = timeSeries.reduce(
      (acc, point) => ({
        totalCalls: acc.totalCalls + point.calls,
        cacheHits: acc.cacheHits + point.cacheHits,
        cacheMisses: acc.cacheMisses + point.cacheMisses,
        totalDuration: acc.totalDuration + point.avgDuration * point.calls,
      }),
      { totalCalls: 0, cacheHits: 0, cacheMisses: 0, totalDuration: 0 }
    );

    return NextResponse.json({
      summary: {
        totalCalls: summary.totalCalls,
        cacheHits: summary.cacheHits,
        cacheMisses: summary.cacheMisses,
        avgDuration:
          summary.totalCalls > 0
            ? Math.round(summary.totalDuration / summary.totalCalls)
            : 0,
      },
      timeSeries,
    });
  } catch (error) {
    console.error("Aggregate metrics fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
