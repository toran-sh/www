import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mongodb";
import { getSession } from "@/lib/tokens";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const userId = await getSession();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { subdomain } = await params;
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));

    // Verify gateway belongs to user
    const gateway = await db.collection("gateways").findOne({
      subdomain,
      user_id: userId,
    });

    if (!gateway) {
      return NextResponse.json({ error: "Gateway not found" }, { status: 404 });
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
        request: {
          method: 1,
          path: 1,
          query: 1,
        },
        response: {
          status: 1,
          bodySize: 1,
        },
        duration: 1,
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
    console.error("Logs fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
