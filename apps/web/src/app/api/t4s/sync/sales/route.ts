import { NextRequest, NextResponse } from "next/server";
import { syncSales } from "@/lib/server/t4s-client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const now = new Date();
    const startDate = body.startDate || new Date(now.getTime() - 7 * 86400000).toISOString().split("T")[0];
    const endDate = body.endDate || now.toISOString().split("T")[0];

    if (new Date(startDate) > new Date(endDate)) {
      return NextResponse.json(
        { success: false, error: "startDate must be before endDate" },
        { status: 400 },
      );
    }

    const count = await syncSales(startDate, endDate);
    return NextResponse.json({ success: true, data: { recordsCount: count } });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
