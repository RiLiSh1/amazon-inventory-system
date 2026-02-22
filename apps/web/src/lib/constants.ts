export const NAV_ITEMS = [
  { href: "/", label: "ダッシュボード", iconName: "dashboard" },
  { href: "/products", label: "商品管理", iconName: "products" },
  { href: "/inventory", label: "在庫管理", iconName: "inventory" },
  { href: "/sales", label: "売上データ", iconName: "sales" },
  { href: "/shipments", label: "納品プラン", iconName: "shipments" },
  { href: "/imports", label: "インポート履歴", iconName: "imports" },
] as const;

export const PRODUCT_STATUS_LABELS: Record<string, string> = {
  active: "有効",
  inactive: "無効",
};

export const SHIPMENT_STATUS_LABELS: Record<string, string> = {
  WORKING: "作業中",
  SHIPPED: "出荷済み",
  RECEIVING: "受領中",
  CLOSED: "完了",
};

export const IMPORT_STATUS_LABELS: Record<string, string> = {
  running: "実行中",
  success: "成功",
  failed: "失敗",
};

export const STOCK_STATUS_OPTIONS = [
  { value: "all", label: "すべて" },
  { value: "low", label: "在庫不足" },
  { value: "normal", label: "正常" },
];
