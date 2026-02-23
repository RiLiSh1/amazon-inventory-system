import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@amazon-inventory/database";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const search = searchParams.get("search") || "";
    const pageNum = Math.max(1, Number(searchParams.get("page") || "1"));
    const perPageNum = Math.min(200, Math.max(1, Number(searchParams.get("perPage") || "20")));

    // Get T4S inventory items and product titles
    const [t4sItems, productRecords] = await Promise.all([
      prisma.t4sInventoryData.findMany(),
      prisma.product.findMany(),
    ]);

    // Build title lookup by ASIN
    const titleMap = new Map<string, { title: string; brand: string | null; price: number | null }>();
    for (const p of productRecords) {
      titleMap.set(p.asin, {
        title: p.title,
        brand: p.brand,
        price: p.price ? Number(p.price) : null,
      });
    }

    let products = t4sItems.map((item) => {
      const info = titleMap.get(item.asin);
      return {
        id: item.id,
        asin: item.asin,
        sku: item.sku,
        title: info?.title || item.asin,
        brand: info?.brand || null,
        category: item.type || null,
        price: info?.price || null,
        status: item.afnFulfillableQty > 0 ? "active" : "inactive",
        createdAt: item.createdAt.toISOString(),
        updatedAt: (item.updateTime || item.createdAt).toISOString(),
      };
    });

    if (search) {
      const q = search.toLowerCase();
      products = products.filter(
        (p) =>
          p.asin.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.title.toLowerCase().includes(q),
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
