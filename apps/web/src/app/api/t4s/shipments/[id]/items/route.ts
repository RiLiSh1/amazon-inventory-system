import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@amazon-inventory/database";

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const items = await prisma.t4sInboundShipmentItem.findMany({
      where: { shipmentId: params.id },
      orderBy: { sku: "asc" },
    });
    return NextResponse.json({ success: true, data: items });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
