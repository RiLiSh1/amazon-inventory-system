import { z } from "zod";

// Common pagination query
export const paginationQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(500).default(20),
});

// Products
export const createProductBody = z.object({
  asin: z.string().min(1).max(20),
  sku: z.string().min(1).max(100),
  title: z.string().min(1).max(500),
  brand: z.string().max(200).optional(),
  category: z.string().max(200).optional(),
  price: z.number().nonnegative().optional(),
  imageUrl: z.string().url().optional(),
});

export const updateProductBody = z.object({
  title: z.string().min(1).max(500).optional(),
  brand: z.string().max(200).nullable().optional(),
  category: z.string().max(200).nullable().optional(),
  price: z.number().nonnegative().nullable().optional(),
  imageUrl: z.string().url().nullable().optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

export const productQuery = paginationQuery.extend({
  search: z.string().optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

// Inventories
export const updateInventoryBody = z.object({
  quantity: z.number().int().nonnegative().optional(),
  availableQuantity: z.number().int().nonnegative().optional(),
  reservedQuantity: z.number().int().nonnegative().optional(),
  reorderPoint: z.number().int().nonnegative().optional(),
  reorderQuantity: z.number().int().nonnegative().optional(),
  warehouseLocation: z.string().max(200).nullable().optional(),
});

export const inventoryQuery = paginationQuery.extend({
  stockStatus: z.enum(["all", "low", "normal"]).optional(),
});

// Sales
export const salesQuery = paginationQuery.extend({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD format required").optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD format required").optional(),
});

export const dateRangeQuery = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD format required").optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD format required").optional(),
});

// Sync
export const syncSalesBody = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

// Helper to validate and return typed data or throw
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errors = result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`);
    const err = new Error(`Validation failed: ${errors.join(", ")}`);
    (err as Error & { statusCode: number }).statusCode = 400;
    throw err;
  }
  return result.data;
}
