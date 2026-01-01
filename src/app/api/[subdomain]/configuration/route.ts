import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mongodb";

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

    return NextResponse.json(gateway);
  } catch (error) {
    console.error("Configuration fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
