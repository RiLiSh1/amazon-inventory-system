import type { FastifyInstance } from "fastify";
import { prisma } from "@amazon-inventory/database";
import { validate, inventoryQuery, updateInventoryBody } from "../lib/validators.js";

export async function inventoryRoutes(app: FastifyInstance) {
  // GET /inventories
  app.get("/inventories", async (request) => {
    const { stockStatus, page, perPage } = validate(inventoryQuery, request.query);
    const perPageNum = Math.min(100, perPage);

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
    const paged = filtered.slice((page - 1) * perPageNum, page * perPageNum);

    return {
      success: true,
      data: paged.map((i) => ({
        ...i,
        product: { ...i.product, price: i.product.price ? Number(i.product.price) : null },
      })),
      meta: { page, perPage: perPageNum, total },
    };
  });

  // PUT /inventories/:id
  app.put("/inventories/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = validate(updateInventoryBody, request.body);
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
