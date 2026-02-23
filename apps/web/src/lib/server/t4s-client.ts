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

interface T4sApiSalesItem {
  date: string;
  seller_id: string;
  marketplace_id: string;
  asin: string;
  sku: string;
  quantity: number;
  amount: number;
}

interface T4sApiInventoryItem {
  seller_id: string;
  marketplace_id: string;
  asin: string;
  sku: string;
  fnsku?: string;
  type?: string;
  afn_fulfillable_qty: number;
  afn_reserved_qty: number;
  status?: string;
  update_time?: string;
}

interface T4sApiShipment {
  seller_id: string;
  shipment_id: string;
  shipment_name?: string;
  shipment_status?: string;
  center_id?: string;
  estimated_time?: string;
  update_time?: string;
}

interface T4sApiShipmentItem {
  shipment_id: string;
  sku: string;
  network_sku?: string;
  qty_shipped: number;
  qty_received: number;
  qty_in_case: number;
}

interface T4sApiResponse<T> {
  data: T[];
}

export async function syncSales(startDate: string, endDate: string): Promise<number> {
  const log = await prisma.t4sImportLog.create({
    data: { endpoint: "/api/sales", status: "running", startedAt: new Date() },
  });

  try {
    const result = await t4sFetch<T4sApiResponse<T4sApiSalesItem>>("/api/sales", {
      seller_id: config.t4s.sellerId,
      marketplace_id: config.t4s.marketplaceId,
      start_date: startDate,
      end_date: endDate,
    });

    const items = result.data || [];
    for (const item of items) {
      await prisma.t4sSalesData.upsert({
        where: {
          date_sellerId_marketplaceId_asin_sku: {
            date: new Date(item.date),
            sellerId: item.seller_id,
            marketplaceId: item.marketplace_id,
            asin: item.asin,
            sku: item.sku,
          },
        },
        update: { quantity: item.quantity, amount: item.amount },
        create: {
          date: new Date(item.date),
          sellerId: item.seller_id,
          marketplaceId: item.marketplace_id,
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
    const result = await t4sFetch<T4sApiResponse<T4sApiInventoryItem>>("/api/inventories", {
      seller_id: config.t4s.sellerId,
      marketplace_id: config.t4s.marketplaceId,
    });

    const items = result.data || [];
    for (const item of items) {
      await prisma.t4sInventoryData.upsert({
        where: {
          sellerId_marketplaceId_sku: {
            sellerId: item.seller_id,
            marketplaceId: item.marketplace_id,
            sku: item.sku,
          },
        },
        update: {
          asin: item.asin,
          fnsku: item.fnsku || null,
          type: item.type || null,
          afnFulfillableQty: item.afn_fulfillable_qty,
          afnReservedQty: item.afn_reserved_qty,
          status: item.status || null,
          updateTime: item.update_time ? new Date(item.update_time) : null,
        },
        create: {
          sellerId: item.seller_id,
          marketplaceId: item.marketplace_id,
          asin: item.asin,
          sku: item.sku,
          fnsku: item.fnsku || null,
          type: item.type || null,
          afnFulfillableQty: item.afn_fulfillable_qty,
          afnReservedQty: item.afn_reserved_qty,
          status: item.status || null,
          updateTime: item.update_time ? new Date(item.update_time) : null,
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
    const result = await t4sFetch<T4sApiResponse<T4sApiShipment>>("/api/inbound-shipments", {
      seller_id: config.t4s.sellerId,
    });

    const shipments = result.data || [];
    for (const s of shipments) {
      await prisma.t4sInboundShipment.upsert({
        where: { shipmentId: s.shipment_id },
        update: {
          shipmentName: s.shipment_name || null,
          shipmentStatus: s.shipment_status || null,
          centerId: s.center_id || null,
          estimatedTime: s.estimated_time ? new Date(s.estimated_time) : null,
          updateTime: s.update_time ? new Date(s.update_time) : null,
        },
        create: {
          sellerId: s.seller_id,
          shipmentId: s.shipment_id,
          shipmentName: s.shipment_name || null,
          shipmentStatus: s.shipment_status || null,
          centerId: s.center_id || null,
          estimatedTime: s.estimated_time ? new Date(s.estimated_time) : null,
          updateTime: s.update_time ? new Date(s.update_time) : null,
        },
      });

      const itemsResult = await t4sFetch<T4sApiResponse<T4sApiShipmentItem>>(
        "/api/inbound-shipments/item",
        { shipment_id: s.shipment_id },
      );

      const items = itemsResult.data || [];
      await prisma.$transaction(async (tx) => {
        await tx.t4sInboundShipmentItem.deleteMany({
          where: { shipmentId: s.shipment_id },
        });
        if (items.length > 0) {
          await tx.t4sInboundShipmentItem.createMany({
            data: items.map((item) => ({
              shipmentId: s.shipment_id,
              sku: item.sku,
              networkSku: item.network_sku || null,
              qtyShipped: item.qty_shipped,
              qtyReceived: item.qty_received,
              qtyInCase: item.qty_in_case,
            })),
          });
        }
      });
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
