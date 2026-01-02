import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mongodb";
import {
  DEFAULT_LOG_FILTERS,
  applyRequestFilters,
  applyResponseFilters,
  type LogFilters,
} from "@/lib/log-filters";

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

    // Fetch gateway to get log filters (fire-and-forget style, but we need filters)
    // Note: Proxy should already apply filters, this is a safety net
    const gateway = await db.collection("gateways").findOne(
      { subdomain },
      { projection: { logFilters: 1 } }
    );

    const logFilters: LogFilters = gateway?.logFilters ?? DEFAULT_LOG_FILTERS;

    // Parse headers first
    const parsedRequest = body.request
      ? {
          ...body.request,
          headers: parseHeaders(body.request.headers),
        }
      : body.request;

    const parsedResponse = body.response
      ? {
          ...body.response,
          headers: parseHeaders(body.response.headers),
        }
      : body.response;

    // Apply filters to request and response
    const filteredRequest = parsedRequest
      ? applyRequestFilters(parsedRequest, logFilters.request)
      : parsedRequest;

    const filteredResponse = parsedResponse
      ? applyResponseFilters(parsedResponse, logFilters.response)
      : parsedResponse;

    const logEntry = {
      subdomain,
      ...body,
      request: filteredRequest,
      response: filteredResponse,
      createdAt: new Date(),
    };

    // Fire-and-forget for fast response
    db.collection("logs")
      .insertOne(logEntry)
      .catch((error) => {
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
