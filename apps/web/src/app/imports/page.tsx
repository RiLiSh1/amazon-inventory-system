import { Header } from "@/components/layout/header";
import { StatusBadge } from "@/components/ui/status-badge";
import { mockImportLogs } from "@/lib/mock-data";
import { IMPORT_STATUS_LABELS } from "@/lib/constants";
import { formatDateTime, formatNumber } from "@/lib/utils";

export default function ImportsPage() {
  const sorted = [...mockImportLogs].sort(
    (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
  );

  return (
    <>
      <Header
        title="インポート履歴"
        description="Tool4Seller APIからのデータ取込ログ"
      />
      <div className="p-8">
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">エンドポイント</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">ステータス</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">件数</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">エラーメッセージ</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">開始日時</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">完了日時</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sorted.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-mono text-gray-700">{log.endpoint}</td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      status={log.status}
                      label={IMPORT_STATUS_LABELS[log.status] || log.status}
                    />
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-gray-700">
                    {formatNumber(log.recordsCount)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {log.errorMessage ? (
                      <span className="text-red-600" title={log.errorMessage}>
                        {log.errorMessage.length > 40
                          ? log.errorMessage.slice(0, 40) + "..."
                          : log.errorMessage}
                      </span>
                    ) : (
                      "---"
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{formatDateTime(log.startedAt)}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {log.completedAt ? formatDateTime(log.completedAt) : "---"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
