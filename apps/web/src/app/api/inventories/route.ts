import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@amazon-inventory/database";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const stockStatus = searchParams.get("stockStatus") || "";
    const pageNum = Math.max(1, Number(searchParams.get("page") || "1"));
    const perPageNum = Math.min(500, Math.max(1, Number(searchParams.get("perPage") || "500")));

    const [t4sItems, productRecords] = await Promise.all([
      prisma.t4sInventoryData.findMany(),
      prisma.product.findMany(),
    ]);

    // Build title lookup by ASIN
    const titleMap = new Map<string, string>();
    for (const p of productRecords) {
      titleMap.set(p.asin, p.title);
    }

    const REORDER_POINT = 10;

    const inventories = t4sItems.map((item) => ({
      id: item.id,
      productId: item.id,
      asin: item.asin,
      quantity: item.afnFulfillableQty + item.afnReservedQty,
      availableQuantity: item.afnFulfillableQty,
      reservedQuantity: item.afnReservedQty,
      reorderPoint: REORDER_POINT,
      reorderQuantity: 50,
      product: {
        sku: item.sku,
        title: titleMap.get(item.asin) || item.asin,
        price: null,
      },
    }));

    let filtered = inventories;
    if (stockStatus === "low") {
      filtered = inventories.filter((i) => i.quantity <= i.reorderPoint);
    } else if (stockStatus === "normal") {
      filtered = inventories.filter((i) => i.quantity > i.reorderPoint);
    }

    const total = filtered.length;
    const paged = filtered.slice((pageNum - 1) * perPageNum, pageNum * perPageNum);

    return NextResponse.json({
      success: true,
      data: paged,
      meta: { page: pageNum, perPage: perPageNum, total },
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
