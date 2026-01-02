import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mongodb";

// Ensure headers are stored as key-value objects, not strings
function parseHeaders(headers: unknown): Record<string, string> {
  if (!headers) return {};
  if (typeof headers === "string") {
    try {
      return JSON.parse(headers);
    } catch {
      return {};
    }
  }
  if (typeof headers === "object" && headers !== null) {
    return headers as Record<string, string>;
  }
  return {};
}

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

    // Ensure headers are always stored as objects
    const logEntry = {
      subdomain,
      ...body,
      request: body.request
        ? {
            ...body.request,
            headers: parseHeaders(body.request.headers),
          }
        : body.request,
      response: body.response
        ? {
            ...body.response,
            headers: parseHeaders(body.response.headers),
          }
        : body.response,
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
