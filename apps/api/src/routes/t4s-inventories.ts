import type { FastifyInstance } from "fastify";
import { prisma } from "@amazon-inventory/database";

export async function t4sInventoryRoutes(app: FastifyInstance) {
  // GET /t4s/inventories
  app.get("/t4s/inventories", async (request) => {
    const { page = "1", perPage = "50" } = request.query as Record<string, string>;
    const pageNum = Math.max(1, Number(page));
    const perPageNum = Math.min(200, Math.max(1, Number(perPage)));

    const [data, total] = await Promise.all([
      prisma.t4sInventoryData.findMany({
        skip: (pageNum - 1) * perPageNum,
        take: perPageNum,
        orderBy: { updatedAt: "desc" },
      }),
      prisma.t4sInventoryData.count(),
    ]);

    return {
      success: true,
      data,
      meta: { page: pageNum, perPage: perPageNum, total },
    };
  });
}
