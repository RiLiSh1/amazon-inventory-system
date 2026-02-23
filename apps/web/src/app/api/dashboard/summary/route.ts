import { NextResponse } from "next/server";
import { prisma } from "@amazon-inventory/database";

export async function GET() {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);

    const [t4sInventories, todaySalesAgg, dailySales] = await Promise.all([
      prisma.t4sInventoryData.findMany(),
      prisma.t4sSalesData.aggregate({
        where: { date: { gte: todayStart } },
        _sum: { amount: true },
      }),
      prisma.t4sSalesData.findMany({
        where: { date: { gte: thirtyDaysAgo } },
        orderBy: { date: "asc" },
      }),
    ]);

    const totalProducts = t4sInventories.length;
    const totalInventory = t4sInventories.reduce((sum, i) => sum + i.afnFulfillableQty + i.afnReservedQty, 0);
    const todaySales = Number(todaySalesAgg._sum.amount || 0);

    // Low stock: fulfillable quantity <= 10
    const lowStockItems = t4sInventories
      .filter((i) => i.afnFulfillableQty <= 10)
      .map((i) => ({
        id: i.id,
        quantity: i.afnFulfillableQty + i.afnReservedQty,
        availableQuantity: i.afnFulfillableQty,
        reorderPoint: 10,
        product: { sku: i.sku, title: i.asin },
      }));

    const dailyMap = new Map<string, { amount: number; quantity: number }>();
    for (const s of dailySales) {
      const key = s.date.toISOString().split("T")[0];
      const existing = dailyMap.get(key) || { amount: 0, quantity: 0 };
      existing.amount += Number(s.amount);
      existing.quantity += s.quantity;
      dailyMap.set(key, existing);
    }
    const chartData = Array.from(dailyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, vals]) => ({ date, ...vals }));

    return NextResponse.json({
      success: true,
      data: {
        kpis: { totalProducts, totalInventory, todaySales, lowStockCount: lowStockItems.length },
        chartData,
        lowStockItems,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
