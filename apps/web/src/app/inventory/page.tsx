"use client";

import { useState, useMemo, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { FilterSelect } from "@/components/ui/filter-select";
import { DataTable, type Column } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { mockInventory, type InventoryWithProduct } from "@/lib/mock-data";
import { STOCK_STATUS_OPTIONS } from "@/lib/constants";
import { formatNumber } from "@/lib/utils";
import { fetchInventories, withFallback } from "@/lib/api-client";

const columns: Column<InventoryWithProduct>[] = [
  {
    key: "sku",
    header: "SKU",
    className: "font-mono",
    render: (row) => row.product.sku,
  },
  {
    key: "title",
    header: "商品名",
    render: (row) => (
      <span className="block max-w-xs truncate" title={row.product.title}>
        {row.product.title}
      </span>
    ),
  },
  {
    key: "quantity",
    header: "在庫数",
    sortable: true,
    className: "text-right",
    render: (row) => formatNumber(row.quantity),
  },
  {
    key: "availableQuantity",
    header: "利用可能",
    className: "text-right",
    render: (row) => formatNumber(row.availableQuantity),
  },
  {
    key: "reservedQuantity",
    header: "予約済み",
    className: "text-right",
    render: (row) => formatNumber(row.reservedQuantity),
  },
  {
    key: "reorderPoint",
    header: "発注点",
    className: "text-right",
    render: (row) => formatNumber(row.reorderPoint),
  },
  {
    key: "status",
    header: "ステータス",
    render: (row) => {
      const isLow = row.quantity <= row.reorderPoint;
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
  const [inventories, setInventories] = useState<InventoryWithProduct[]>(mockInventory);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    withFallback(
      () => fetchInventories(),
      () => mockInventory,
    ).then((data) => {
      setInventories(data as InventoryWithProduct[]);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    if (filter === "low") return inventories.filter((i) => i.quantity <= i.reorderPoint);
    if (filter === "normal") return inventories.filter((i) => i.quantity > i.reorderPoint);
    return inventories;
  }, [filter, inventories]);

  const lowCount = inventories.filter((i) => i.quantity <= i.reorderPoint).length;

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
        ) : (
          <DataTable
            columns={columns}
            data={filtered}
            keyExtractor={(row) => row.id}
            rowClassName={(row) =>
              row.quantity <= row.reorderPoint ? "bg-red-50" : undefined
            }
          />
        )}
      </div>
    </>
  );
}
