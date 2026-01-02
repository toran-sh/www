import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { db } from "@/lib/mongodb";
import { getSession } from "@/lib/tokens";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getSession();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid gateway ID" }, { status: 400 });
    }

    const gateway = await db.collection("gateways").findOne({
      _id: new ObjectId(id),
      user_id: userId,
    });

    if (!gateway) {
      return NextResponse.json({ error: "Gateway not found" }, { status: 404 });
    }

    return NextResponse.json(gateway);
  } catch (error) {
    console.error("Gateway fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getSession();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { cacheTtl, logFilters } = body;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid gateway ID" }, { status: 400 });
    }

    const updateFields: Record<string, unknown> = {
      cacheTtl: cacheTtl ?? null,
      updatedAt: new Date(),
    };

    // Only update logFilters if provided
    if (logFilters !== undefined) {
      updateFields.logFilters = logFilters;
    }

    const result = await db.collection("gateways").findOneAndUpdate(
      { _id: new ObjectId(id), user_id: userId },
      { $set: updateFields },
      { returnDocument: "after" }
    );

    if (!result) {
      return NextResponse.json({ error: "Gateway not found" }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Gateway update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getSession();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid gateway ID" }, { status: 400 });
    }

    const result = await db.collection("gateways").deleteOne({
      _id: new ObjectId(id),
      user_id: userId,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Gateway not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Gateway delete error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
