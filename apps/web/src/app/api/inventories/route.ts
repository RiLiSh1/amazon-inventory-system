import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@amazon-inventory/database";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const stockStatus = searchParams.get("stockStatus") || "";
    const pageNum = Math.max(1, Number(searchParams.get("page") || "1"));
    const perPageNum = Math.min(100, Math.max(1, Number(searchParams.get("perPage") || "20")));

    const allInventories = await prisma.inventory.findMany({
      include: { product: true },
      orderBy: { updatedAt: "desc" },
    });

    let filtered = allInventories;
    if (stockStatus === "low") {
      filtered = allInventories.filter((i) => i.quantity <= i.reorderPoint);
    } else if (stockStatus === "normal") {
      filtered = allInventories.filter((i) => i.quantity > i.reorderPoint);
    }

    const total = filtered.length;
    const paged = filtered.slice((pageNum - 1) * perPageNum, pageNum * perPageNum);

    return NextResponse.json({
      success: true,
      data: paged.map((i) => ({
        ...i,
        product: { ...i.product, price: i.product.price ? Number(i.product.price) : null },
      })),
      meta: { page: pageNum, perPage: perPageNum, total },
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
