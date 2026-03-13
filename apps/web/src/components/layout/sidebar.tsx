"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Layers,
  TrendingUp,
  Truck,
  Download,
  Menu,
  Box,
} from "lucide-react";
import { NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from "react";

const iconMap: Record<string, React.ElementType> = {
  dashboard: LayoutDashboard,
  products: Package,
  inventory: Layers,
  sales: TrendingUp,
  shipments: Truck,
  imports: Download,
};

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      <div className="flex h-16 items-center gap-3 px-6">
        <Box className="h-8 w-8 text-orange-400" />
        <span className="text-lg font-bold text-white">在庫管理</span>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = iconMap[item.iconName];
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-gray-800 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              )}
            >
              {Icon && <Icon className="h-5 w-5" />}
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-gray-800 px-6 py-4">
        <p className="text-xs text-gray-500">Amazon Inventory System</p>
        <p className="text-xs text-gray-600">v0.1.0</p>
      </div>
    </>
  );
}

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 flex-col bg-gray-900 lg:flex">
      <SidebarNav />
    </aside>
  );
}

export function MobileSidebarTrigger() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring lg:hidden"
          aria-label="メニューを開く"
        >
          <Menu className="h-6 w-6" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 bg-gray-900 p-0 border-gray-800">
        <SheetHeader className="sr-only">
          <SheetTitle>ナビゲーション</SheetTitle>
        </SheetHeader>
        <div className="flex h-full flex-col">
          <SidebarNav onNavigate={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
