import { NextResponse } from "next/server";
import { prisma } from "@amazon-inventory/database";

export async function GET() {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);

    const [totalProducts, inventories, todaySalesAgg, dailySales] = await Promise.all([
      prisma.product.count({ where: { status: "active" } }),
      prisma.inventory.findMany({ include: { product: true } }),
      prisma.t4sSalesData.aggregate({
        where: { date: { gte: todayStart } },
        _sum: { amount: true },
      }),
      prisma.t4sSalesData.findMany({
        where: { date: { gte: thirtyDaysAgo } },
        orderBy: { date: "asc" },
      }),
    ]);

    const totalInventory = inventories.reduce((sum, i) => sum + i.quantity, 0);
    const lowStockItems = inventories.filter((i) => i.quantity <= i.reorderPoint);
    const todaySales = Number(todaySalesAgg._sum.amount || 0);

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
        lowStockItems: lowStockItems.map((i) => ({
          ...i,
          product: { ...i.product, price: i.product.price ? Number(i.product.price) : null },
        })),
      },
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
