import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@amazon-inventory/database";

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const product = await prisma.product.findUnique({ where: { id: params.id } });
    if (!product) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json({
      success: true,
      data: { ...product, price: product.price ? Number(product.price) : null },
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const product = await prisma.product.update({ where: { id: params.id }, data: body });
    return NextResponse.json({
      success: true,
      data: { ...product, price: product.price ? Number(product.price) : null },
    });
  } catch {
    return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
  }
}
