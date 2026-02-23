import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@amazon-inventory/database";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const inventory = await prisma.inventory.update({
      where: { id: params.id },
      data: body,
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
