import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mongodb";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const { subdomain } = await params;
    console.log("Log received for subdomain:", subdomain);

    if (!subdomain) {
      return NextResponse.json(
        { error: "Subdomain is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    console.log("Log body:", JSON.stringify(body).slice(0, 200));

    const logEntry = {
      subdomain,
      ...body,
      createdAt: new Date(),
    };

    // Await insert to catch errors
    const result = await db.collection("logs").insertOne(logEntry);
    console.log("Log inserted:", result.insertedId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Log request error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
