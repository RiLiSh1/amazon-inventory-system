import type { Metadata } from "next";
import { Sidebar } from "@/components/layout/sidebar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Amazon 在庫管理システム",
  description: "Amazon マーケットプレイスの在庫管理を自動化するWebアプリケーション",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex flex-1 flex-col ml-64 overflow-hidden">
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </body>
    </html>
  );
}
