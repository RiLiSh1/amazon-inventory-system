"use client";

import { useState, useMemo, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { FilterSelect } from "@/components/ui/filter-select";
import { DataTable, type Column } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { STOCK_STATUS_OPTIONS } from "@/lib/constants";
import { formatNumber } from "@/lib/utils";
import { fetchInventories } from "@/lib/api-client";

interface InventoryItem {
  id: string;
  productId: string;
  quantity: number;
  availableQuantity: number;
  reservedQuantity: number;
  reorderPoint: number;
  reorderQuantity: number;
  product: { sku: string; title: string; price: number | null };
}

const columns: Column<InventoryItem>[] = [
  {
    key: "title",
    header: "商品名",
    render: (row) => (
      <span className="block max-w-sm truncate" title={row.product.title}>
        {row.product.title}
      </span>
    ),
  },
  {
    key: "sku",
    header: "SKU",
    className: "font-mono text-sm",
    render: (row) => row.product.sku,
  },
  {
    key: "quantity",
    header: "総在庫",
    sortable: true,
    className: "text-right",
    render: (row) => formatNumber(row.quantity),
  },
  {
    key: "availableQuantity",
    header: "出荷可能",
    className: "text-right",
    render: (row) => formatNumber(row.availableQuantity),
  },
  {
    key: "reservedQuantity",
    header: "予約済",
    className: "text-right",
    render: (row) => formatNumber(row.reservedQuantity),
  },
  {
    key: "status",
    header: "ステータス",
    render: (row) => {
      const isLow = row.availableQuantity <= row.reorderPoint;
      return (
        <StatusBadge
          status={isLow ? "low" : "normal"}
          label={isLow ? "在庫不足" : "正常"}
        />
      );
    },
  },
];

export default function InventoryPage() {
  const [filter, setFilter] = useState("all");
  const [inventories, setInventories] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInventories()
      .then((data) => setInventories(data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (filter === "low") return inventories.filter((i) => i.availableQuantity <= i.reorderPoint);
    if (filter === "normal") return inventories.filter((i) => i.availableQuantity > i.reorderPoint);
    return inventories;
  }, [filter, inventories]);

  const lowCount = inventories.filter((i) => i.availableQuantity <= i.reorderPoint).length;

  return (
    <>
      <Header
        title="在庫管理"
        description={`全${inventories.length}件 / 在庫不足: ${lowCount}件`}
      />
      <div className="p-8 space-y-6">
        <FilterSelect
          label="在庫ステータス"
          value={filter}
          options={STOCK_STATUS_OPTIONS}
          onChange={setFilter}
        />
        {loading ? (
          <div className="flex items-center justify-center p-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          </div>
        ) : error ? (
          <p className="text-red-600">データの取得に失敗しました: {error}</p>
        ) : (
          <DataTable
            columns={columns}
            data={filtered}
            keyExtractor={(row) => row.id}
            rowClassName={(row) =>
              row.availableQuantity <= row.reorderPoint ? "bg-red-50" : undefined
            }
          />
        )}
      </div>
    </>
  );
}
