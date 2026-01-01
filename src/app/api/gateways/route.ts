import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mongodb";
import { getSession } from "@/lib/tokens";
import { generateSubdomain } from "@/lib/subdomain";

export async function GET() {
  try {
    const userId = await getSession();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const gateways = await db
      .collection("gateways")
      .find({ user_id: userId })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(gateways);
  } catch (error) {
    console.error("Gateways fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getSession();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { upstreamBaseUrl, cacheTtl } = body;

    if (!upstreamBaseUrl) {
      return NextResponse.json(
        { error: "Upstream base URL is required" },
        { status: 400 }
      );
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
      user_id: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("gateways").insertOne(gateway);

    return NextResponse.json({
      ...gateway,
      _id: result.insertedId,
    });
  } catch (error) {
    console.error("Gateway create error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
