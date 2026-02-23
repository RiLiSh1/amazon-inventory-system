const EXTERNAL_API = process.env.NEXT_PUBLIC_API_URL;
const API_PREFIX = EXTERNAL_API ? "" : "/api";
const API_BASE = EXTERNAL_API || "";

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${API_PREFIX}${path}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const json = await res.json();
  return json as T;
}

interface ApiListResponse<T> {
  success: boolean;
  data: T[];
  meta?: { page: number; perPage: number; total: number };
}

interface ApiItemResponse<T> {
  success: boolean;
  data: T;
}

export async function fetchDashboardSummary() {
  const res = await apiFetch<ApiItemResponse<{
    kpis: { totalProducts: number; totalInventory: number; todaySales: number; lowStockCount: number };
    chartData: { date: string; amount: number; quantity: number }[];
    lowStockItems: Array<{
      id: string;
      quantity: number;
      availableQuantity: number;
      reorderPoint: number;
      product: { sku: string; title: string };
    }>;
  }>>("/dashboard/summary");
  return res.data;
}

export async function fetchProducts(search?: string) {
  const params = new URLSearchParams({ perPage: "200" });
  if (search) params.set("search", search);
  const res = await apiFetch<ApiListResponse<{
    id: string;
    asin: string;
    sku: string;
    title: string;
    brand: string | null;
    category: string | null;
    price: number | null;
    status: string;
    createdAt: string;
    updatedAt: string;
  }>>(`/products?${params}`);
  return res.data;
}

export async function fetchInventories(stockStatus?: string) {
  const params = new URLSearchParams({ perPage: "200" });
  if (stockStatus && stockStatus !== "all") params.set("stockStatus", stockStatus);
  const res = await apiFetch<ApiListResponse<{
    id: string;
    productId: string;
    asin: string;
    quantity: number;
    availableQuantity: number;
    reservedQuantity: number;
    reorderPoint: number;
    reorderQuantity: number;
    product: { sku: string; title: string; price: number | null };
  }>>(`/inventories?${params}`);
  return res.data;
}

export async function fetchSalesData(startDate: string, endDate: string) {
  const params = new URLSearchParams({ startDate, endDate, perPage: "500" });
  const res = await apiFetch<ApiListResponse<{
    id: string;
    date: string;
    asin: string;
    sku: string;
    quantity: number;
    amount: number;
  }>>(`/t4s/sales?${params}`);
  return res.data;
}

export async function fetchDailySales(startDate: string, endDate: string) {
  const params = new URLSearchParams({ startDate, endDate });
  const res = await apiFetch<ApiItemResponse<{ date: string; amount: number; quantity: number }[]>>(
    `/t4s/sales/daily?${params}`,
  );
  return res.data;
}

export async function fetchShipments() {
  const res = await apiFetch<ApiListResponse<{
    id: string;
    shipmentId: string;
    shipmentName: string | null;
    shipmentStatus: string | null;
    centerId: string | null;
    estimatedTime: string | null;
    updateTime: string | null;
  }>>("/t4s/shipments?perPage=200");
  return res.data;
}

export async function fetchShipmentItems(shipmentId: string) {
  const res = await apiFetch<ApiItemResponse<Array<{
    id: string;
    shipmentId: string;
    sku: string;
    networkSku: string | null;
    qtyShipped: number;
    qtyReceived: number;
    qtyInCase: number;
  }>>>(`/t4s/shipments/${shipmentId}/items`);
  return res.data;
}

export async function fetchImportLogs() {
  const res = await apiFetch<ApiListResponse<{
    id: string;
    endpoint: string;
    status: string;
    recordsCount: number;
    errorMessage: string | null;
    startedAt: string;
    completedAt: string | null;
  }>>("/t4s/import-logs?perPage=200");
  return res.data;
}
