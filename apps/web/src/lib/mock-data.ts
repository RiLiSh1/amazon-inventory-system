import type {
  Product,
  Inventory,
  T4sSalesData,
  T4sInventoryData,
  T4sInboundShipment,
  T4sInboundShipmentItem,
  T4sImportLog,
} from "@amazon-inventory/shared";

// --- Products ---
export const mockProducts: Product[] = [
  { id: "prod-001", asin: "B0DEXAMPLE1", sku: "SKU-BOTTLE-001", title: "高品質ステンレスボトル 500ml", brand: "EcoBottle", category: "キッチン用品", price: 2980, imageUrl: null, status: "active", createdAt: new Date("2024-01-15"), updatedAt: new Date("2024-11-01") },
  { id: "prod-002", asin: "B0DEXAMPLE2", sku: "SKU-CHARGER-001", title: "USB-C 急速充電器 65W PD対応", brand: "TechGear", category: "電子機器", price: 3480, imageUrl: null, status: "active", createdAt: new Date("2024-02-10"), updatedAt: new Date("2024-11-05") },
  { id: "prod-003", asin: "B0DEXAMPLE3", sku: "SKU-CUSHION-001", title: "低反発クッション オフィスチェア用", brand: "HomeComfort", category: "ホーム＆リビング", price: 4280, imageUrl: null, status: "active", createdAt: new Date("2024-02-20"), updatedAt: new Date("2024-10-15") },
  { id: "prod-004", asin: "B0DEXAMPLE4", sku: "SKU-BAND-001", title: "フィットネスバンド 5本セット", brand: "FitLife", category: "スポーツ＆アウトドア", price: 1980, imageUrl: null, status: "active", createdAt: new Date("2024-03-01"), updatedAt: new Date("2024-11-10") },
  { id: "prod-005", asin: "B0DEXAMPLE5", sku: "SKU-LIGHT-001", title: "LEDデスクライト 調光調色", brand: "TechGear", category: "電子機器", price: 5980, imageUrl: null, status: "active", createdAt: new Date("2024-03-15"), updatedAt: new Date("2024-10-20") },
  { id: "prod-006", asin: "B0DEXAMPLE6", sku: "SKU-MAT-001", title: "ヨガマット 6mm 収納バッグ付き", brand: "FitLife", category: "スポーツ＆アウトドア", price: 2480, imageUrl: null, status: "active", createdAt: new Date("2024-04-01"), updatedAt: new Date("2024-11-12") },
  { id: "prod-007", asin: "B0DEXAMPLE7", sku: "SKU-AROMA-001", title: "アロマディフューザー 超音波式 300ml", brand: "HomeComfort", category: "ホーム＆リビング", price: 3980, imageUrl: null, status: "active", createdAt: new Date("2024-04-10"), updatedAt: new Date("2024-10-25") },
  { id: "prod-008", asin: "B0DEXAMPLE8", sku: "SKU-CABLE-001", title: "USB-C to Lightning ケーブル 2m 2本セット", brand: "TechGear", category: "電子機器", price: 1580, imageUrl: null, status: "active", createdAt: new Date("2024-05-01"), updatedAt: new Date("2024-11-08") },
  { id: "prod-009", asin: "B0DEXAMPLE9", sku: "SKU-TOWEL-001", title: "速乾マイクロファイバータオル 3枚セット", brand: "FitLife", category: "スポーツ＆アウトドア", price: 1280, imageUrl: null, status: "active", createdAt: new Date("2024-05-15"), updatedAt: new Date("2024-10-30") },
  { id: "prod-010", asin: "B0DEXAMPL10", sku: "SKU-STAND-001", title: "ノートPCスタンド アルミ製 角度調整", brand: "TechGear", category: "電子機器", price: 4580, imageUrl: null, status: "active", createdAt: new Date("2024-06-01"), updatedAt: new Date("2024-11-02") },
  { id: "prod-011", asin: "B0DEXAMPL11", sku: "SKU-PILLOW-001", title: "安眠枕 高さ調整可能 洗えるカバー", brand: "HomeComfort", category: "ホーム＆リビング", price: 3580, imageUrl: null, status: "inactive", createdAt: new Date("2024-06-15"), updatedAt: new Date("2024-09-01") },
  { id: "prod-012", asin: "B0DEXAMPL12", sku: "SKU-SCALE-001", title: "体組成計 Bluetooth対応 アプリ連携", brand: "FitLife", category: "スポーツ＆アウトドア", price: 3280, imageUrl: null, status: "active", createdAt: new Date("2024-07-01"), updatedAt: new Date("2024-11-15") },
  { id: "prod-013", asin: "B0DEXAMPL13", sku: "SKU-HUB-001", title: "USB-Cハブ 7in1 HDMI対応", brand: "TechGear", category: "電子機器", price: 4980, imageUrl: null, status: "active", createdAt: new Date("2024-07-15"), updatedAt: new Date("2024-11-03") },
  { id: "prod-014", asin: "B0DEXAMPL14", sku: "SKU-CANDLE-001", title: "ソイキャンドル ラベンダー 3個セット", brand: "HomeComfort", category: "ホーム＆リビング", price: 2180, imageUrl: null, status: "inactive", createdAt: new Date("2024-08-01"), updatedAt: new Date("2024-09-15") },
  { id: "prod-015", asin: "B0DEXAMPL15", sku: "SKU-BOTTLE-002", title: "プロテインシェイカー 600ml BPAフリー", brand: "FitLife", category: "スポーツ＆アウトドア", price: 1480, imageUrl: null, status: "active", createdAt: new Date("2024-08-15"), updatedAt: new Date("2024-11-18") },
  { id: "prod-016", asin: "B0DEXAMPL16", sku: "SKU-MOUSE-001", title: "ワイヤレスマウス 静音 USB-C充電", brand: "TechGear", category: "電子機器", price: 2780, imageUrl: null, status: "active", createdAt: new Date("2024-09-01"), updatedAt: new Date("2024-11-20") },
  { id: "prod-017", asin: "B0DEXAMPL17", sku: "SKU-FILTER-001", title: "浄水ポット フィルター3個付き", brand: "EcoBottle", category: "キッチン用品", price: 3680, imageUrl: null, status: "active", createdAt: new Date("2024-09-15"), updatedAt: new Date("2024-11-22") },
  { id: "prod-018", asin: "B0DEXAMPL18", sku: "SKU-ROPE-001", title: "トレーニングジャンプロープ 調整可能", brand: "FitLife", category: "スポーツ＆アウトドア", price: 980, imageUrl: null, status: "active", createdAt: new Date("2024-10-01"), updatedAt: new Date("2024-11-25") },
];

// --- Inventory ---
export type InventoryWithProduct = Inventory & { product: Product };

const productMap = new Map(mockProducts.map((p) => [p.id, p]));

export const mockInventory: InventoryWithProduct[] = [
  { id: "inv-001", productId: "prod-001", product: productMap.get("prod-001")!, warehouseLocation: "FBA-TYO1", quantity: 150, availableQuantity: 130, reservedQuantity: 20, reorderPoint: 50, reorderQuantity: 200, lastSyncedAt: new Date("2024-11-25"), createdAt: new Date("2024-01-15"), updatedAt: new Date("2024-11-25") },
  { id: "inv-002", productId: "prod-002", product: productMap.get("prod-002")!, warehouseLocation: "FBA-TYO2", quantity: 8, availableQuantity: 5, reservedQuantity: 3, reorderPoint: 30, reorderQuantity: 100, lastSyncedAt: new Date("2024-11-25"), createdAt: new Date("2024-02-10"), updatedAt: new Date("2024-11-25") },
  { id: "inv-003", productId: "prod-003", product: productMap.get("prod-003")!, warehouseLocation: "FBA-TYO1", quantity: 85, availableQuantity: 75, reservedQuantity: 10, reorderPoint: 40, reorderQuantity: 150, lastSyncedAt: new Date("2024-11-25"), createdAt: new Date("2024-02-20"), updatedAt: new Date("2024-11-25") },
  { id: "inv-004", productId: "prod-004", product: productMap.get("prod-004")!, warehouseLocation: "FBA-OSA1", quantity: 320, availableQuantity: 300, reservedQuantity: 20, reorderPoint: 100, reorderQuantity: 500, lastSyncedAt: new Date("2024-11-25"), createdAt: new Date("2024-03-01"), updatedAt: new Date("2024-11-25") },
  { id: "inv-005", productId: "prod-005", product: productMap.get("prod-005")!, warehouseLocation: "FBA-TYO2", quantity: 12, availableQuantity: 10, reservedQuantity: 2, reorderPoint: 20, reorderQuantity: 80, lastSyncedAt: new Date("2024-11-25"), createdAt: new Date("2024-03-15"), updatedAt: new Date("2024-11-25") },
  { id: "inv-006", productId: "prod-006", product: productMap.get("prod-006")!, warehouseLocation: "FBA-OSA1", quantity: 200, availableQuantity: 185, reservedQuantity: 15, reorderPoint: 60, reorderQuantity: 250, lastSyncedAt: new Date("2024-11-25"), createdAt: new Date("2024-04-01"), updatedAt: new Date("2024-11-25") },
  { id: "inv-007", productId: "prod-007", product: productMap.get("prod-007")!, warehouseLocation: "FBA-TYO1", quantity: 45, availableQuantity: 40, reservedQuantity: 5, reorderPoint: 30, reorderQuantity: 100, lastSyncedAt: new Date("2024-11-25"), createdAt: new Date("2024-04-10"), updatedAt: new Date("2024-11-25") },
  { id: "inv-008", productId: "prod-008", product: productMap.get("prod-008")!, warehouseLocation: "FBA-TYO2", quantity: 15, availableQuantity: 12, reservedQuantity: 3, reorderPoint: 50, reorderQuantity: 200, lastSyncedAt: new Date("2024-11-25"), createdAt: new Date("2024-05-01"), updatedAt: new Date("2024-11-25") },
  { id: "inv-009", productId: "prod-009", product: productMap.get("prod-009")!, warehouseLocation: "FBA-OSA1", quantity: 180, availableQuantity: 170, reservedQuantity: 10, reorderPoint: 80, reorderQuantity: 300, lastSyncedAt: new Date("2024-11-25"), createdAt: new Date("2024-05-15"), updatedAt: new Date("2024-11-25") },
  { id: "inv-010", productId: "prod-010", product: productMap.get("prod-010")!, warehouseLocation: "FBA-TYO1", quantity: 55, availableQuantity: 50, reservedQuantity: 5, reorderPoint: 25, reorderQuantity: 80, lastSyncedAt: new Date("2024-11-25"), createdAt: new Date("2024-06-01"), updatedAt: new Date("2024-11-25") },
  { id: "inv-011", productId: "prod-012", product: productMap.get("prod-012")!, warehouseLocation: "FBA-TYO2", quantity: 5, availableQuantity: 3, reservedQuantity: 2, reorderPoint: 20, reorderQuantity: 60, lastSyncedAt: new Date("2024-11-25"), createdAt: new Date("2024-07-01"), updatedAt: new Date("2024-11-25") },
  { id: "inv-012", productId: "prod-013", product: productMap.get("prod-013")!, warehouseLocation: "FBA-TYO1", quantity: 70, availableQuantity: 65, reservedQuantity: 5, reorderPoint: 30, reorderQuantity: 100, lastSyncedAt: new Date("2024-11-25"), createdAt: new Date("2024-07-15"), updatedAt: new Date("2024-11-25") },
  { id: "inv-013", productId: "prod-015", product: productMap.get("prod-015")!, warehouseLocation: "FBA-OSA1", quantity: 250, availableQuantity: 240, reservedQuantity: 10, reorderPoint: 100, reorderQuantity: 400, lastSyncedAt: new Date("2024-11-25"), createdAt: new Date("2024-08-15"), updatedAt: new Date("2024-11-25") },
  { id: "inv-014", productId: "prod-016", product: productMap.get("prod-016")!, warehouseLocation: "FBA-TYO2", quantity: 90, availableQuantity: 85, reservedQuantity: 5, reorderPoint: 40, reorderQuantity: 120, lastSyncedAt: new Date("2024-11-25"), createdAt: new Date("2024-09-01"), updatedAt: new Date("2024-11-25") },
  { id: "inv-015", productId: "prod-017", product: productMap.get("prod-017")!, warehouseLocation: "FBA-TYO1", quantity: 110, availableQuantity: 100, reservedQuantity: 10, reorderPoint: 50, reorderQuantity: 150, lastSyncedAt: new Date("2024-11-25"), createdAt: new Date("2024-09-15"), updatedAt: new Date("2024-11-25") },
  { id: "inv-016", productId: "prod-018", product: productMap.get("prod-018")!, warehouseLocation: "FBA-OSA1", quantity: 400, availableQuantity: 390, reservedQuantity: 10, reorderPoint: 150, reorderQuantity: 500, lastSyncedAt: new Date("2024-11-25"), createdAt: new Date("2024-10-01"), updatedAt: new Date("2024-11-25") },
];

// --- Sales Data (last 30 days) ---
function generateSalesData(): T4sSalesData[] {
  const data: T4sSalesData[] = [];
  const skus = [
    { asin: "B0DEXAMPLE1", sku: "SKU-BOTTLE-001", avgQty: 5, avgPrice: 2980 },
    { asin: "B0DEXAMPLE2", sku: "SKU-CHARGER-001", avgQty: 8, avgPrice: 3480 },
    { asin: "B0DEXAMPLE4", sku: "SKU-BAND-001", avgQty: 12, avgPrice: 1980 },
    { asin: "B0DEXAMPLE6", sku: "SKU-MAT-001", avgQty: 4, avgPrice: 2480 },
    { asin: "B0DEXAMPLE8", sku: "SKU-CABLE-001", avgQty: 15, avgPrice: 1580 },
    { asin: "B0DEXAMPL15", sku: "SKU-BOTTLE-002", avgQty: 10, avgPrice: 1480 },
    { asin: "B0DEXAMPL16", sku: "SKU-MOUSE-001", avgQty: 6, avgPrice: 2780 },
    { asin: "B0DEXAMPL18", sku: "SKU-ROPE-001", avgQty: 20, avgPrice: 980 },
  ];
  const now = new Date();
  let id = 1;

  for (let dayOffset = 29; dayOffset >= 0; dayOffset--) {
    const date = new Date(now);
    date.setDate(date.getDate() - dayOffset);
    date.setHours(0, 0, 0, 0);
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const factor = isWeekend ? 0.6 : 1;

    for (const item of skus) {
      const qty = Math.max(1, Math.round(item.avgQty * factor * (0.7 + Math.random() * 0.6)));
      const amount = qty * item.avgPrice;
      data.push({
        id: `sale-${String(id++).padStart(4, "0")}`,
        date,
        sellerId: "SELLER001",
        marketplaceId: "ATVPDKIKX0DER",
        asin: item.asin,
        sku: item.sku,
        quantity: qty,
        amount,
        createdAt: date,
        updatedAt: date,
      });
    }
  }
  return data;
}

export const mockSalesData: T4sSalesData[] = generateSalesData();

// --- Daily aggregated sales for charts ---
export const mockDailySales: { date: string; amount: number; quantity: number }[] = (() => {
  const map = new Map<string, { amount: number; quantity: number }>();
  for (const sale of mockSalesData) {
    const key = new Date(sale.date).toISOString().split("T")[0];
    const existing = map.get(key) || { amount: 0, quantity: 0 };
    existing.amount += sale.amount;
    existing.quantity += sale.quantity;
    map.set(key, existing);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, vals]) => ({ date, ...vals }));
})();

// --- T4S Inventory Data ---
export const mockT4sInventory: T4sInventoryData[] = mockInventory.map((inv, i) => ({
  id: `t4sinv-${String(i + 1).padStart(3, "0")}`,
  sellerId: "SELLER001",
  marketplaceId: "ATVPDKIKX0DER",
  asin: inv.product.asin,
  sku: inv.product.sku,
  fnsku: `X00${String(i + 1).padStart(4, "0")}FN`,
  type: "AFN",
  afnFulfillableQty: inv.availableQuantity,
  afnReservedQty: inv.reservedQuantity,
  status: inv.quantity <= inv.reorderPoint ? "LOW" : "IN_STOCK",
  updateTime: new Date("2024-11-25T10:30:00"),
  createdAt: inv.createdAt,
  updatedAt: inv.updatedAt,
}));

// --- Inbound Shipments ---
export const mockShipments: T4sInboundShipment[] = [
  { id: "ship-001", sellerId: "SELLER001", shipmentId: "FBA18N1PRGK7", shipmentName: "年末セール補充 - バッチA", shipmentStatus: "CLOSED", centerId: "NRT5", estimatedTime: new Date("2024-11-10"), updateTime: new Date("2024-11-12T14:30:00"), createdAt: new Date("2024-11-01"), updatedAt: new Date("2024-11-12") },
  { id: "ship-002", sellerId: "SELLER001", shipmentId: "FBA18N2QXYZ1", shipmentName: "年末セール補充 - バッチB", shipmentStatus: "CLOSED", centerId: "KIX2", estimatedTime: new Date("2024-11-15"), updateTime: new Date("2024-11-17T09:15:00"), createdAt: new Date("2024-11-05"), updatedAt: new Date("2024-11-17") },
  { id: "ship-003", sellerId: "SELLER001", shipmentId: "FBA18N3ABCD2", shipmentName: "在庫不足対応 - 急速充電器", shipmentStatus: "RECEIVING", centerId: "NRT5", estimatedTime: new Date("2024-11-28"), updateTime: new Date("2024-11-25T16:45:00"), createdAt: new Date("2024-11-18"), updatedAt: new Date("2024-11-25") },
  { id: "ship-004", sellerId: "SELLER001", shipmentId: "FBA18N4EFGH3", shipmentName: "定期補充 - フィットネス商品", shipmentStatus: "SHIPPED", centerId: "KIX2", estimatedTime: new Date("2024-12-01"), updateTime: new Date("2024-11-23T11:00:00"), createdAt: new Date("2024-11-20"), updatedAt: new Date("2024-11-23") },
  { id: "ship-005", sellerId: "SELLER001", shipmentId: "FBA18N5IJKL4", shipmentName: "定期補充 - 電子機器", shipmentStatus: "SHIPPED", centerId: "NRT5", estimatedTime: new Date("2024-12-03"), updateTime: new Date("2024-11-24T08:30:00"), createdAt: new Date("2024-11-21"), updatedAt: new Date("2024-11-24") },
  { id: "ship-006", sellerId: "SELLER001", shipmentId: "FBA18N6MNOP5", shipmentName: "新商品投入 - 浄水ポット追加", shipmentStatus: "WORKING", centerId: "NRT5", estimatedTime: null, updateTime: new Date("2024-11-25T13:00:00"), createdAt: new Date("2024-11-25"), updatedAt: new Date("2024-11-25") },
];

// --- Inbound Shipment Items ---
export const mockShipmentItems: T4sInboundShipmentItem[] = [
  { id: "si-001", shipmentId: "FBA18N1PRGK7", sku: "SKU-BOTTLE-001", networkSku: "X000001FN", qtyShipped: 100, qtyReceived: 100, qtyInCase: 20, createdAt: new Date("2024-11-01"), updatedAt: new Date("2024-11-12") },
  { id: "si-002", shipmentId: "FBA18N1PRGK7", sku: "SKU-CUSHION-001", networkSku: "X000003FN", qtyShipped: 50, qtyReceived: 50, qtyInCase: 10, createdAt: new Date("2024-11-01"), updatedAt: new Date("2024-11-12") },
  { id: "si-003", shipmentId: "FBA18N2QXYZ1", sku: "SKU-BAND-001", networkSku: "X000004FN", qtyShipped: 200, qtyReceived: 200, qtyInCase: 50, createdAt: new Date("2024-11-05"), updatedAt: new Date("2024-11-17") },
  { id: "si-004", shipmentId: "FBA18N2QXYZ1", sku: "SKU-MAT-001", networkSku: "X000006FN", qtyShipped: 80, qtyReceived: 80, qtyInCase: 10, createdAt: new Date("2024-11-05"), updatedAt: new Date("2024-11-17") },
  { id: "si-005", shipmentId: "FBA18N3ABCD2", sku: "SKU-CHARGER-001", networkSku: "X000002FN", qtyShipped: 100, qtyReceived: 65, qtyInCase: 25, createdAt: new Date("2024-11-18"), updatedAt: new Date("2024-11-25") },
  { id: "si-006", shipmentId: "FBA18N3ABCD2", sku: "SKU-CABLE-001", networkSku: "X000008FN", qtyShipped: 150, qtyReceived: 90, qtyInCase: 30, createdAt: new Date("2024-11-18"), updatedAt: new Date("2024-11-25") },
  { id: "si-007", shipmentId: "FBA18N4EFGH3", sku: "SKU-SCALE-001", networkSku: "X000011FN", qtyShipped: 60, qtyReceived: 0, qtyInCase: 12, createdAt: new Date("2024-11-20"), updatedAt: new Date("2024-11-23") },
  { id: "si-008", shipmentId: "FBA18N4EFGH3", sku: "SKU-BOTTLE-002", networkSku: "X000013FN", qtyShipped: 150, qtyReceived: 0, qtyInCase: 30, createdAt: new Date("2024-11-20"), updatedAt: new Date("2024-11-23") },
  { id: "si-009", shipmentId: "FBA18N4EFGH3", sku: "SKU-ROPE-001", networkSku: "X000016FN", qtyShipped: 200, qtyReceived: 0, qtyInCase: 50, createdAt: new Date("2024-11-20"), updatedAt: new Date("2024-11-23") },
  { id: "si-010", shipmentId: "FBA18N5IJKL4", sku: "SKU-LIGHT-001", networkSku: "X000005FN", qtyShipped: 60, qtyReceived: 0, qtyInCase: 10, createdAt: new Date("2024-11-21"), updatedAt: new Date("2024-11-24") },
  { id: "si-011", shipmentId: "FBA18N5IJKL4", sku: "SKU-HUB-001", networkSku: "X000012FN", qtyShipped: 50, qtyReceived: 0, qtyInCase: 10, createdAt: new Date("2024-11-21"), updatedAt: new Date("2024-11-24") },
  { id: "si-012", shipmentId: "FBA18N5IJKL4", sku: "SKU-MOUSE-001", networkSku: "X000014FN", qtyShipped: 80, qtyReceived: 0, qtyInCase: 20, createdAt: new Date("2024-11-21"), updatedAt: new Date("2024-11-24") },
  { id: "si-013", shipmentId: "FBA18N6MNOP5", sku: "SKU-FILTER-001", networkSku: "X000015FN", qtyShipped: 100, qtyReceived: 0, qtyInCase: 20, createdAt: new Date("2024-11-25"), updatedAt: new Date("2024-11-25") },
];

// --- Import Logs ---
export const mockImportLogs: T4sImportLog[] = [
  { id: "log-001", endpoint: "/api/sales", status: "success", recordsCount: 240, errorMessage: null, startedAt: new Date("2024-11-25T06:00:00"), completedAt: new Date("2024-11-25T06:02:15"), createdAt: new Date("2024-11-25T06:00:00") },
  { id: "log-002", endpoint: "/api/inventories", status: "success", recordsCount: 18, errorMessage: null, startedAt: new Date("2024-11-25T06:05:00"), completedAt: new Date("2024-11-25T06:05:30"), createdAt: new Date("2024-11-25T06:05:00") },
  { id: "log-003", endpoint: "/api/inbound-shipments", status: "success", recordsCount: 6, errorMessage: null, startedAt: new Date("2024-11-25T06:10:00"), completedAt: new Date("2024-11-25T06:10:12"), createdAt: new Date("2024-11-25T06:10:00") },
  { id: "log-004", endpoint: "/api/inbound-shipments/item", status: "success", recordsCount: 13, errorMessage: null, startedAt: new Date("2024-11-25T06:10:15"), completedAt: new Date("2024-11-25T06:10:28"), createdAt: new Date("2024-11-25T06:10:15") },
  { id: "log-005", endpoint: "/api/sales", status: "failed", recordsCount: 0, errorMessage: "API rate limit exceeded. Quota: 0/30", startedAt: new Date("2024-11-24T12:00:00"), completedAt: new Date("2024-11-24T12:00:05"), createdAt: new Date("2024-11-24T12:00:00") },
  { id: "log-006", endpoint: "/api/inventories", status: "success", recordsCount: 18, errorMessage: null, startedAt: new Date("2024-11-24T06:05:00"), completedAt: new Date("2024-11-24T06:05:28"), createdAt: new Date("2024-11-24T06:05:00") },
  { id: "log-007", endpoint: "/api/sales", status: "success", recordsCount: 235, errorMessage: null, startedAt: new Date("2024-11-24T06:00:00"), completedAt: new Date("2024-11-24T06:02:10"), createdAt: new Date("2024-11-24T06:00:00") },
  { id: "log-008", endpoint: "/api/inbound-shipments", status: "success", recordsCount: 5, errorMessage: null, startedAt: new Date("2024-11-24T06:10:00"), completedAt: new Date("2024-11-24T06:10:10"), createdAt: new Date("2024-11-24T06:10:00") },
  { id: "log-009", endpoint: "/api/sales", status: "success", recordsCount: 228, errorMessage: null, startedAt: new Date("2024-11-23T06:00:00"), completedAt: new Date("2024-11-23T06:02:08"), createdAt: new Date("2024-11-23T06:00:00") },
  { id: "log-010", endpoint: "/api/inventories", status: "failed", recordsCount: 0, errorMessage: "Connection timeout after 30000ms", startedAt: new Date("2024-11-23T06:05:00"), completedAt: new Date("2024-11-23T06:05:30"), createdAt: new Date("2024-11-23T06:05:00") },
  { id: "log-011", endpoint: "/api/inventories", status: "success", recordsCount: 18, errorMessage: null, startedAt: new Date("2024-11-23T06:06:00"), completedAt: new Date("2024-11-23T06:06:25"), createdAt: new Date("2024-11-23T06:06:00") },
  { id: "log-012", endpoint: "/api/sales", status: "running", recordsCount: 0, errorMessage: null, startedAt: new Date("2024-11-25T12:00:00"), completedAt: null, createdAt: new Date("2024-11-25T12:00:00") },
  { id: "log-013", endpoint: "/api/inventories", status: "running", recordsCount: 0, errorMessage: null, startedAt: new Date("2024-11-25T12:00:05"), completedAt: null, createdAt: new Date("2024-11-25T12:00:05") },
];

// --- Dashboard KPIs ---
export const mockDashboardKPIs = {
  totalProducts: mockProducts.filter((p) => p.status === "active").length,
  totalInventory: mockInventory.reduce((sum, i) => sum + i.quantity, 0),
  todaySales: mockDailySales.length > 0 ? mockDailySales[mockDailySales.length - 1].amount : 0,
  lowStockCount: mockInventory.filter((i) => i.quantity <= i.reorderPoint).length,
};

export const mockLowStockItems = mockInventory.filter((i) => i.quantity <= i.reorderPoint);
