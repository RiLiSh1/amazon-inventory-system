import { NextResponse } from "next/server";
import { syncShipments } from "@/lib/server/t4s-client";

export async function POST() {
  try {
    const count = await syncShipments();
    return NextResponse.json({ success: true, data: { recordsCount: count } });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
