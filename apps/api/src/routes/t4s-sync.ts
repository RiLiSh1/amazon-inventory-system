import type { FastifyInstance } from "fastify";
import { syncSales, syncInventories, syncShipments } from "../lib/t4s-client.js";

export async function t4sSyncRoutes(app: FastifyInstance) {
  // POST /t4s/sync/sales
  app.post("/t4s/sync/sales", async (request, reply) => {
    const { startDate, endDate } = request.body as { startDate?: string; endDate?: string };
    const now = new Date();
    const start = startDate || new Date(now.getTime() - 30 * 86400000).toISOString().split("T")[0];
    const end = endDate || now.toISOString().split("T")[0];

    try {
      const count = await syncSales(start, end);
      return { success: true, data: { recordsCount: count } };
    } catch (err) {
      return reply.status(500).send({
        success: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  });

  // POST /t4s/sync/inventories
  app.post("/t4s/sync/inventories", async (_request, reply) => {
    try {
      const count = await syncInventories();
      return { success: true, data: { recordsCount: count } };
    } catch (err) {
      return reply.status(500).send({
        success: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  });

  // POST /t4s/sync/shipments
  app.post("/t4s/sync/shipments", async (_request, reply) => {
    try {
      const count = await syncShipments();
      return { success: true, data: { recordsCount: count } };
    } catch (err) {
      return reply.status(500).send({
        success: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  });
}
