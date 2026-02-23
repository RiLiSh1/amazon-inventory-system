import type { FastifyInstance } from "fastify";
import { prisma } from "@amazon-inventory/database";

export async function inventoryRoutes(app: FastifyInstance) {
  // GET /inventories
  app.get("/inventories", async (request) => {
    const { stockStatus, page = "1", perPage = "20" } = request.query as Record<string, string>;
    const pageNum = Math.max(1, Number(page));
    const perPageNum = Math.min(100, Math.max(1, Number(perPage)));

    const allInventories = await prisma.inventory.findMany({
      include: { product: true },
      orderBy: { updatedAt: "desc" },
    });

    let filtered = allInventories;
    if (stockStatus === "low") {
      filtered = allInventories.filter((i) => i.quantity <= i.reorderPoint);
    } else if (stockStatus === "normal") {
      filtered = allInventories.filter((i) => i.quantity > i.reorderPoint);
    }

    const total = filtered.length;
    const paged = filtered.slice((pageNum - 1) * perPageNum, pageNum * perPageNum);

    return {
      success: true,
      data: paged.map((i) => ({
        ...i,
        product: { ...i.product, price: i.product.price ? Number(i.product.price) : null },
      })),
      meta: { page: pageNum, perPage: perPageNum, total },
    };
  });

  // PUT /inventories/:id
  app.put("/inventories/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as {
      quantity?: number;
      availableQuantity?: number;
      reservedQuantity?: number;
      reorderPoint?: number;
      reorderQuantity?: number;
      warehouseLocation?: string;
    };
    try {
      const inventory = await prisma.inventory.update({
        where: { id },
        data: body,
        include: { product: true },
      });
      return {
        success: true,
        data: {
          ...inventory,
          product: { ...inventory.product, price: inventory.product.price ? Number(inventory.product.price) : null },
        },
      };
    } catch {
      return reply.status(404).send({ success: false, error: "Inventory not found" });
    }
  });
}
