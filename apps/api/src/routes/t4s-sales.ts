import type { FastifyInstance } from "fastify";
import { prisma } from "@amazon-inventory/database";

export async function t4sSalesRoutes(app: FastifyInstance) {
  // GET /t4s/sales
  app.get("/t4s/sales", async (request) => {
    const { startDate, endDate, page = "1", perPage = "50" } = request.query as Record<string, string>;
    const pageNum = Math.max(1, Number(page));
    const perPageNum = Math.min(200, Math.max(1, Number(perPage)));

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

    const [data, total] = await Promise.all([
      prisma.t4sSalesData.findMany({
        where,
        skip: (pageNum - 1) * perPageNum,
        take: perPageNum,
        orderBy: { date: "desc" },
      }),
      prisma.t4sSalesData.count({ where }),
    ]);

    return {
      success: true,
      data: data.map((d) => ({ ...d, amount: Number(d.amount) })),
      meta: { page: pageNum, perPage: perPageNum, total },
    };
  });

  // GET /t4s/sales/daily
  app.get("/t4s/sales/daily", async (request) => {
    const { startDate, endDate } = request.query as Record<string, string>;

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

    return { success: true, data };
  });
}
