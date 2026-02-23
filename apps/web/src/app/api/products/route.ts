import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@amazon-inventory/database";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const search = searchParams.get("search") || "";
    const pageNum = Math.max(1, Number(searchParams.get("page") || "1"));
    const perPageNum = Math.min(200, Math.max(1, Number(searchParams.get("perPage") || "20")));

    // Build products from T4S inventory data (unique by ASIN+SKU)
    const t4sItems = await prisma.t4sInventoryData.findMany();

    const productMap = new Map<string, {
      id: string;
      asin: string;
      sku: string;
      title: string;
      brand: string | null;
      category: string | null;
      price: number | null;
      status: string;
      createdAt: string;
      updatedAt: string;
    }>();

    for (const item of t4sItems) {
      const key = `${item.asin}_${item.sku}`;
      if (!productMap.has(key)) {
        productMap.set(key, {
          id: item.id,
          asin: item.asin,
          sku: item.sku,
          title: item.asin, // ASIN as placeholder title
          brand: null,
          category: item.type || null,
          price: null,
          status: item.afnFulfillableQty > 0 ? "active" : "inactive",
          createdAt: item.createdAt.toISOString(),
          updatedAt: (item.updateTime || item.createdAt).toISOString(),
        });
      }
    }

    let products = Array.from(productMap.values());

    if (search) {
      const q = search.toLowerCase();
      products = products.filter(
        (p) =>
          p.asin.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q),
      );
    }

    const total = products.length;
    const paged = products.slice((pageNum - 1) * perPageNum, pageNum * perPageNum);

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
