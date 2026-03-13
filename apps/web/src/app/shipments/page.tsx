"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { DataTable, type Column } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { SHIPMENT_STATUS_LABELS } from "@/lib/constants";
import { formatDate, formatDateTime, formatNumber } from "@/lib/utils";
import { fetchShipments, fetchShipmentItems } from "@/lib/api-client";
import type { T4sInboundShipment, T4sInboundShipmentItem } from "@amazon-inventory/shared";

const columns: Column<T4sInboundShipment>[] = [
  { key: "shipmentId", header: "Shipment ID", className: "font-mono" },
  {
    key: "shipmentName",
    header: "納品プラン名",
    render: (row) => row.shipmentName || "---",
  },
  {
    key: "shipmentStatus",
    header: "ステータス",
    render: (row) => (
      <StatusBadge
        status={row.shipmentStatus || ""}
        label={
          row.shipmentStatus
            ? SHIPMENT_STATUS_LABELS[row.shipmentStatus] || row.shipmentStatus
            : "---"
        }
      />
    ),
  },
  {
    key: "centerId",
    header: "FC",
    render: (row) => row.centerId || "---",
  },
  {
    key: "estimatedTime",
    header: "到着予定日",
    render: (row) => (row.estimatedTime ? formatDate(row.estimatedTime) : "---"),
  },
  {
    key: "updateTime",
    header: "最終更新",
    render: (row) => (row.updateTime ? formatDateTime(row.updateTime) : "---"),
  },
];

function ShipmentItemsTable({ shipmentId }: { shipmentId: string }) {
  const [items, setItems] = useState<T4sInboundShipmentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShipmentItems(shipmentId)
      .then((raw) => {
        setItems(
          raw.map((i) => ({
            ...i,
            createdAt: new Date(),
            updatedAt: new Date(),
          })) as T4sInboundShipmentItem[],
        );
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [shipmentId]);

  if (loading) {
    return <div className="flex justify-center p-4"><div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" /></div>;
  }
  if (items.length === 0) {
    return <p className="text-sm text-gray-500">明細データなし</p>;
  }
  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead>
        <tr>
          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">SKU</th>
          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Network SKU</th>
          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">出荷数量</th>
          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">受領数量</th>
          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">ケース数</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {items.map((item) => (
          <tr key={item.id}>
            <td className="px-4 py-2 text-sm font-mono text-gray-700">{item.sku}</td>
            <td className="px-4 py-2 text-sm font-mono text-gray-500">{item.networkSku || "---"}</td>
            <td className="px-4 py-2 text-right text-sm text-gray-700">{formatNumber(item.qtyShipped)}</td>
            <td className="px-4 py-2 text-right text-sm text-gray-700">{formatNumber(item.qtyReceived)}</td>
            <td className="px-4 py-2 text-right text-sm text-gray-700">{formatNumber(item.qtyInCase)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState<T4sInboundShipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchShipments()
      .then((raw) => {
        setShipments(
          raw.map((s) => ({
            ...s,
            sellerId: "",
            estimatedTime: s.estimatedTime ? new Date(s.estimatedTime) : null,
            updateTime: s.updateTime ? new Date(s.updateTime) : null,
            createdAt: new Date(),
            updatedAt: new Date(),
          })),
        );
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Header
        title="納品プラン"
        description={`全${shipments.length}件の納品プラン（クリックで明細展開）`}
      />
      <div className="p-8">
        {loading ? (
          <div className="flex items-center justify-center p-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          </div>
        ) : error ? (
          <p className="text-red-600">データの取得に失敗しました: {error}</p>
        ) : (
          <DataTable
            columns={columns}
            data={shipments}
            keyExtractor={(row) => row.id}
            expandable
            renderExpanded={(row) => <ShipmentItemsTable shipmentId={row.shipmentId} />}
          />
        )}
      </div>
    </>
  );
}
