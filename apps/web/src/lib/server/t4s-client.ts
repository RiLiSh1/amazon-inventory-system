import { prisma } from "@amazon-inventory/database";
import { config } from "./config";
import { t4sRateLimiter } from "./rate-limiter";

async function t4sFetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(endpoint, config.t4s.baseUrl);
  for (const [key, value] of Object.entries(params)) {
    if (value) url.searchParams.set(key, value);
  }

  let lastError: Error | null = null;
  for (let attempt = 0; attempt < config.retryCount; attempt++) {
    await t4sRateLimiter.acquire();

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), config.timeoutMs);

    try {
      const res = await fetch(url.toString(), {
        headers: { "TS-API-KEY": config.t4s.apiKey },
        signal: controller.signal,
      });
      if (!res.ok) {
        throw new Error(`T4S API ${res.status}: ${await res.text()}`);
      }
      return (await res.json()) as T;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < config.retryCount - 1) {
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise((r) => setTimeout(r, delay));
      }
    } finally {
      clearTimeout(timeout);
    }
  }
  throw lastError;
}

const T4S_PAGE_SIZE = 100;

const T4S_MAX_PAGES = 50;

/** Fetch all pages from a T4S API endpoint using startIndex pagination (max 100 per page). */
async function t4sFetchAll<T>(endpoint: string, params: Record<string, string> = {}): Promise<T[]> {
  const all: T[] = [];
  let startIndex = 0;

  for (let page = 0; page < T4S_MAX_PAGES; page++) {
    const items = await t4sFetch<T[]>(endpoint, {
      ...params,
      count: String(T4S_PAGE_SIZE),
      startIndex: String(startIndex),
    });

    if (!Array.isArray(items) || items.length === 0) break;

    all.push(...items);

    if (items.length < T4S_PAGE_SIZE) break;

    startIndex += T4S_PAGE_SIZE;
  }

  return all;
}

// T4S API returns arrays directly, with camelCase field names

interface T4sApiSalesItem {
  date: string;
  sellerId: string;
  marketplaceId: string;
  asin: string;
  sku: string;
  quantity: number;
  amount: number;
}

interface T4sApiInventoryItem {
  sellerId: string;
  marketplaceId: string;
  asin: string;
  sku: string;
  fnsku?: string;
  type?: string;
  afnFulfillableQuantity: number;
  afnReservedQuantity: number;
  status?: number;
  updateTime?: number;
}

interface T4sApiShipment {
  shipmentId: string;
  shipmentName?: string;
  shipmentStatus?: string;
  centerId?: string;
  estimatedTime?: number;
  updateTime?: number;
}

interface T4sApiShipmentItem {
  shipmentId: string;
  sku: string;
  networkSku?: string;
  qtyShipped: number;
  qtyReceived: number;
  qtyInCase: number;
}

export async function syncSales(startDate: string, endDate: string): Promise<number> {
  const log = await prisma.t4sImportLog.create({
    data: { endpoint: "/api/sales", status: "running", startedAt: new Date() },
  });

  try {
    const startTime = Math.floor(new Date(startDate).getTime() / 1000);
    const endTime = Math.floor(new Date(endDate).getTime() / 1000);
    const items = await t4sFetchAll<T4sApiSalesItem>("/api/sales", {
      sellerId: config.t4s.sellerId,
      marketplaceId: config.t4s.marketplaceId,
      startTime: String(startTime),
      endTime: String(endTime),
    });

    for (const item of items) {
      await prisma.t4sSalesData.upsert({
        where: {
          date_sellerId_marketplaceId_asin_sku: {
            date: new Date(item.date),
            sellerId: item.sellerId,
            marketplaceId: item.marketplaceId,
            asin: item.asin,
            sku: item.sku,
          },
        },
        update: { quantity: item.quantity, amount: item.amount },
        create: {
          date: new Date(item.date),
          sellerId: item.sellerId,
          marketplaceId: item.marketplaceId,
          asin: item.asin,
          sku: item.sku,
          quantity: item.quantity,
          amount: item.amount,
        },
      });
    }

    await prisma.t4sImportLog.update({
      where: { id: log.id },
      data: { status: "success", recordsCount: items.length, completedAt: new Date() },
    });
    return items.length;
  } catch (err) {
    await prisma.t4sImportLog.update({
      where: { id: log.id },
      data: {
        status: "failed",
        errorMessage: err instanceof Error ? err.message : String(err),
        completedAt: new Date(),
      },
    });
    throw err;
  }
}

export async function syncInventories(): Promise<number> {
  const log = await prisma.t4sImportLog.create({
    data: { endpoint: "/api/inventories", status: "running", startedAt: new Date() },
  });

  try {
    const items = await t4sFetchAll<T4sApiInventoryItem>("/api/inventories", {
      sellerId: config.t4s.sellerId,
      marketplaceId: config.t4s.marketplaceId,
    });

    for (const item of items) {
      await prisma.t4sInventoryData.upsert({
        where: {
          sellerId_marketplaceId_sku: {
            sellerId: item.sellerId,
            marketplaceId: item.marketplaceId,
            sku: item.sku,
          },
        },
        update: {
          asin: item.asin,
          fnsku: item.fnsku || null,
          type: item.type || null,
          afnFulfillableQty: item.afnFulfillableQuantity,
          afnReservedQty: item.afnReservedQuantity,
          status: item.status != null ? String(item.status) : null,
          updateTime: item.updateTime ? new Date(item.updateTime * 1000) : null,
        },
        create: {
          sellerId: item.sellerId,
          marketplaceId: item.marketplaceId,
          asin: item.asin,
          sku: item.sku,
          fnsku: item.fnsku || null,
          type: item.type || null,
          afnFulfillableQty: item.afnFulfillableQuantity,
          afnReservedQty: item.afnReservedQuantity,
          status: item.status != null ? String(item.status) : null,
          updateTime: item.updateTime ? new Date(item.updateTime * 1000) : null,
        },
      });
    }

    await prisma.t4sImportLog.update({
      where: { id: log.id },
      data: { status: "success", recordsCount: items.length, completedAt: new Date() },
    });
    return items.length;
  } catch (err) {
    await prisma.t4sImportLog.update({
      where: { id: log.id },
      data: {
        status: "failed",
        errorMessage: err instanceof Error ? err.message : String(err),
        completedAt: new Date(),
      },
    });
    throw err;
  }
}

export async function syncShipments(): Promise<number> {
  const log = await prisma.t4sImportLog.create({
    data: { endpoint: "/api/inbound-shipments", status: "running", startedAt: new Date() },
  });

  try {
    const shipments = await t4sFetchAll<T4sApiShipment>("/api/inbound-shipments", {
      sellerId: config.t4s.sellerId,
    });

    for (const s of shipments) {
      await prisma.t4sInboundShipment.upsert({
        where: { shipmentId: s.shipmentId },
        update: {
          shipmentName: s.shipmentName || null,
          shipmentStatus: s.shipmentStatus || null,
          centerId: s.centerId || null,
          estimatedTime: s.estimatedTime ? new Date(s.estimatedTime * 1000) : null,
          updateTime: s.updateTime ? new Date(s.updateTime * 1000) : null,
        },
        create: {
          sellerId: config.t4s.sellerId,
          shipmentId: s.shipmentId,
          shipmentName: s.shipmentName || null,
          shipmentStatus: s.shipmentStatus || null,
          centerId: s.centerId || null,
          estimatedTime: s.estimatedTime ? new Date(s.estimatedTime * 1000) : null,
          updateTime: s.updateTime ? new Date(s.updateTime * 1000) : null,
        },
      });

      // Fetch items for each shipment (may 404 for some)
      try {
        const items = await t4sFetch<T4sApiShipmentItem[]>(
          "/api/inbound-shipments/item",
          { shipmentId: s.shipmentId },
        );

        if (Array.isArray(items) && items.length > 0) {
          await prisma.$transaction(async (tx) => {
            await tx.t4sInboundShipmentItem.deleteMany({
              where: { shipmentId: s.shipmentId },
            });
            await tx.t4sInboundShipmentItem.createMany({
              data: items.map((item) => ({
                shipmentId: s.shipmentId,
                sku: item.sku,
                networkSku: item.networkSku || null,
                qtyShipped: item.qtyShipped,
                qtyReceived: item.qtyReceived,
                qtyInCase: item.qtyInCase,
              })),
            });
          });
        }
      } catch {
        // Skip items that return 404 or other errors
      }
    }

    await prisma.t4sImportLog.update({
      where: { id: log.id },
      data: { status: "success", recordsCount: shipments.length, completedAt: new Date() },
    });
    return shipments.length;
  } catch (err) {
    await prisma.t4sImportLog.update({
      where: { id: log.id },
      data: {
        status: "failed",
        errorMessage: err instanceof Error ? err.message : String(err),
        completedAt: new Date(),
      },
    });
    throw err;
  }
}
