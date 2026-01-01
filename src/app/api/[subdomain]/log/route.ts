import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mongodb";

export async function POST(
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

    const body = await request.json();

    const logEntry = {
      subdomain,
      ...body,
      createdAt: new Date(),
    };

    // Fire-and-forget for fast response
    db.collection("logs").insertOne(logEntry).catch((error) => {
      console.error("Log insert error:", error);
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Log request error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
