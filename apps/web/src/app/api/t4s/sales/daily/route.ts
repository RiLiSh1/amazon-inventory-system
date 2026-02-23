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

    const sales = await prisma.t4sSalesData.findMany({ where, orderBy: { date: "asc" } });

    const dailyMap = new Map<string, { amount: number; quantity: number }>();
    for (const s of sales) {
      const key = s.date.toISOString().split("T")[0];
      const existing = dailyMap.get(key) || { amount: 0, quantity: 0 };
      existing.amount += Number(s.amount);
      existing.quantity += s.quantity;
      dailyMap.set(key, existing);
    }

    const data = Array.from(dailyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, vals]) => ({ date, ...vals }));

    return NextResponse.json({ success: true, data });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
