import type { FastifyInstance } from "fastify";
import { prisma } from "@amazon-inventory/database";
import { validate, productQuery, createProductBody, updateProductBody } from "../lib/validators.js";

export async function productRoutes(app: FastifyInstance) {
  // GET /products
  app.get("/products", async (request) => {
    const { search, status, page, perPage } = validate(productQuery, request.query);
    const perPageNum = Math.min(100, perPage);

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { asin: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
        { title: { contains: search, mode: "insensitive" } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip: (page - 1) * perPageNum,
        take: perPageNum,
        orderBy: { updatedAt: "desc" },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      success: true,
      data: data.map((p) => ({ ...p, price: p.price ? Number(p.price) : null })),
      meta: { page, perPage: perPageNum, total },
    };
  });

  // GET /products/:id
  app.get("/products/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return reply.status(404).send({ success: false, error: "Product not found" });
    }
    return { success: true, data: { ...product, price: product.price ? Number(product.price) : null } };
  });

  // POST /products
  app.post("/products", async (request) => {
    const body = validate(createProductBody, request.body);
    const product = await prisma.product.create({ data: body });
    return { success: true, data: { ...product, price: product.price ? Number(product.price) : null } };
  });

  // PUT /products/:id
  app.put("/products/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = validate(updateProductBody, request.body);
    try {
      const product = await prisma.product.update({ where: { id }, data: body });
      return { success: true, data: { ...product, price: product.price ? Number(product.price) : null } };
    } catch {
      return reply.status(404).send({ success: false, error: "Product not found" });
    }
  });
}
