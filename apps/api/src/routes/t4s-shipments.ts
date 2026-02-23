import type { FastifyInstance } from "fastify";
import { prisma } from "@amazon-inventory/database";

export async function t4sShipmentRoutes(app: FastifyInstance) {
  // GET /t4s/shipments
  app.get("/t4s/shipments", async (request) => {
    const { page = "1", perPage = "50" } = request.query as Record<string, string>;
    const pageNum = Math.max(1, Number(page));
    const perPageNum = Math.min(200, Math.max(1, Number(perPage)));

    const [data, total] = await Promise.all([
      prisma.t4sInboundShipment.findMany({
        skip: (pageNum - 1) * perPageNum,
        take: perPageNum,
        orderBy: { updatedAt: "desc" },
      }),
      prisma.t4sInboundShipment.count(),
    ]);

    return {
      success: true,
      data,
      meta: { page: pageNum, perPage: perPageNum, total },
    };
  });

  // GET /t4s/shipments/:id/items
  app.get("/t4s/shipments/:id/items", async (request) => {
    const { id } = request.params as { id: string };
    const items = await prisma.t4sInboundShipmentItem.findMany({
      where: { shipmentId: id },
      orderBy: { sku: "asc" },
    });
    return { success: true, data: items };
  });
}
