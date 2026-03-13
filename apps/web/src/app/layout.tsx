import type { Metadata, Viewport } from "next";
import { Sidebar } from "@/components/layout/sidebar";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Amazon 在庫管理システム",
    template: "%s | Amazon 在庫管理",
  },
  description:
    "Amazon マーケットプレイスの在庫管理を自動化するWebアプリケーション",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className="flex h-screen overflow-hidden bg-background text-foreground">
        <Providers>
          <Sidebar />
          <div className="flex flex-1 flex-col overflow-hidden lg:ml-64">
            <main className="flex-1 overflow-y-auto">{children}</main>
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
