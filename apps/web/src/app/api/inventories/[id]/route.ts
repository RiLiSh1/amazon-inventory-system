import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@amazon-inventory/database";

const ALLOWED_INVENTORY_FIELDS = ["reorderPoint", "reorderQuantity", "warehouseLocation"] as const;

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();

    const data: Record<string, unknown> = {};
    for (const key of ALLOWED_INVENTORY_FIELDS) {
      if (key in body) data[key] = body[key];
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { success: false, error: "No valid fields provided" },
        { status: 400 },
      );
    }

    const inventory = await prisma.inventory.update({
      where: { id: params.id },
      data,
      include: { product: true },
    });
    return NextResponse.json({
      success: true,
      data: {
        ...inventory,
        product: { ...inventory.product, price: inventory.product.price ? Number(inventory.product.price) : null },
      },
    });
  } catch {
    return NextResponse.json({ success: false, error: "Inventory not found" }, { status: 404 });
  }
}
