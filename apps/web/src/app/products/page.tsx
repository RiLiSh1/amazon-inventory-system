"use client";

import { useState, useMemo, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { SearchInput } from "@/components/ui/search-input";
import { FilterSelect } from "@/components/ui/filter-select";
import { DataTable, type Column } from "@/components/ui/data-table";
import { KPICard } from "@/components/ui/kpi-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatCurrency } from "@/lib/utils";
import { fetchProducts } from "@/lib/api-client";

interface ProductRow {
  id: string;
  asin: string;
  sku: string;
  title: string;
  brand: string | null;
  price: number | null;
  status: string;
}

const STATUS_OPTIONS = [
  { value: "all", label: "すべて" },
  { value: "active", label: "販売中" },
  { value: "inactive", label: "停止中" },
];

const columns: Column<ProductRow>[] = [
  {
    key: "title",
    header: "商品名",
    sortable: true,
    render: (row) => (
      <div>
        <span className="font-medium text-gray-900">{row.title}</span>
        {row.brand && (
          <span className="block text-xs text-gray-500 mt-0.5">{row.brand}</span>
        )}
      </div>
    ),
  },
  {
    key: "sku",
    header: "SKU",
    sortable: true,
    className: "font-mono text-xs whitespace-nowrap",
  },
  {
    key: "asin",
    header: "ASIN",
    sortable: true,
    className: "font-mono text-xs whitespace-nowrap",
    render: (row) => (
      <a
        href={`https://www.amazon.co.jp/dp/${row.asin}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline"
        onClick={(e) => e.stopPropagation()}
      >
        {row.asin}
      </a>
    ),
  },
  {
    key: "price",
    header: "価格",
    sortable: true,
    className: "text-right whitespace-nowrap",
    render: (row) =>
      row.price != null ? (
        <span className="text-gray-900">{formatCurrency(row.price)}</span>
      ) : (
        <span className="text-gray-400">-</span>
      ),
  },
  {
    key: "status",
    header: "状態",
    className: "whitespace-nowrap",
    render: (row) => (
      <StatusBadge
        status={row.status}
        label={row.status === "active" ? "販売中" : "停止中"}
      />
    ),
  },
];

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts()
      .then((raw) =>
        setProducts(
          raw.map((p) => ({
            id: p.id,
            asin: p.asin,
            sku: p.sku,
            title: p.title,
            brand: p.brand,
            price: p.price,
            status: p.status,
          })),
        ),
      )
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let result = products;
    if (statusFilter !== "all") {
      result = result.filter((p) => p.status === statusFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.asin.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.title.toLowerCase().includes(q) ||
          (p.brand && p.brand.toLowerCase().includes(q)),
      );
    }
    return result;
  }, [search, statusFilter, products]);

  const activeCount = products.filter((p) => p.status === "active").length;
  const inactiveCount = products.length - activeCount;

  return (
    <>
      <Header title="商品管理" description="登録済み商品の一覧と検索" />
      <div className="p-8 space-y-6">
        {/* KPI Cards */}
        {!loading && !error && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <KPICard title="全商品数" value={products.length} />
            <KPICard title="販売中" value={activeCount} />
            <KPICard title="停止中" value={inactiveCount} />
          </div>
        )}

        {/* Toolbar */}
        <div className="rounded-xl border border-gray-200 bg-white px-6 py-4 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-sm flex-1">
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="ASIN、SKU、商品名、ブランドで検索..."
              />
            </div>
            <div className="flex items-center gap-4">
              <FilterSelect
                label="ステータス"
                value={statusFilter}
                options={STATUS_OPTIONS}
                onChange={setStatusFilter}
              />
              <span className="text-sm text-gray-500">
                {filtered.length}件表示
              </span>
            </div>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center p-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-4">
            <p className="text-sm text-red-700">データの取得に失敗しました: {error}</p>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filtered}
            keyExtractor={(row) => row.id}
          />
        )}
      </div>
    </>
  );
}
