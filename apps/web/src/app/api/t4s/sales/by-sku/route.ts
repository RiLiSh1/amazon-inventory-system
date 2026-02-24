import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@amazon-inventory/database";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const where: Record<string, unknown> = {};
    if (startDate || endDate) {
      const dateFilter: Record<string, Date> = {};
      if (startDate) dateFilter.gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        dateFilter.lte = end;
      }
      where.date = dateFilter;
    }

    const grouped = await prisma.t4sSalesData.groupBy({
      by: ["sku", "asin"],
      where,
      _sum: { amount: true, quantity: true },
      orderBy: { _sum: { amount: "desc" } },
    });

    const skus = grouped.map((g) => g.sku);
    const products = await prisma.product.findMany({
      where: { sku: { in: skus } },
      select: { sku: true, title: true },
    });
    const productMap = new Map(products.map((p) => [p.sku, p.title]));

    const data = grouped.map((g) => ({
      sku: g.sku,
      asin: g.asin,
      title: productMap.get(g.sku) ?? "",
      totalAmount: Number(g._sum.amount ?? 0),
      totalQuantity: g._sum.quantity ?? 0,
    }));

    return NextResponse.json({ success: true, data });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
