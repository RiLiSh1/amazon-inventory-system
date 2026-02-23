"use client";

import { useState, useMemo, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { SearchInput } from "@/components/ui/search-input";
import { DataTable, type Column } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { fetchProducts } from "@/lib/api-client";

interface ProductRow {
  id: string;
  asin: string;
  sku: string;
  title: string;
  status: string;
}

const columns: Column<ProductRow>[] = [
  {
    key: "title",
    header: "商品名",
    sortable: true,
    render: (row) => (
      <span className="block max-w-sm truncate" title={row.title}>
        {row.title}
      </span>
    ),
  },
  { key: "sku", header: "SKU", sortable: true, className: "font-mono text-sm" },
  { key: "asin", header: "ASIN", sortable: true, className: "font-mono text-sm" },
  {
    key: "status",
    header: "ステータス",
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
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts()
      .then((raw) => setProducts(raw.map((p) => ({
        id: p.id,
        asin: p.asin,
        sku: p.sku,
        title: p.title,
        status: p.status,
      }))))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (!search) return products;
    const q = search.toLowerCase();
    return products.filter(
      (p) =>
        p.asin.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.title.toLowerCase().includes(q),
    );
  }, [search, products]);

  return (
    <>
      <Header title="商品管理" description={`全${products.length}件の商品`} />
      <div className="p-8 space-y-6">
        <div className="max-w-md">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="ASIN、SKU、商品名で検索..."
          />
        </div>
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
          />
        )}
      </div>
    </>
  );
}
