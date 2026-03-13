"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { MobileSidebarTrigger } from "@/components/layout/sidebar";

interface HeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      aria-label="テーマを切り替え"
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </button>
  );
}

export function Header({ title, description, children }: HeaderProps) {
  return (
    <header className="border-b border-border bg-background px-4 py-5 sm:px-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MobileSidebarTrigger />
          <div>
            <h1 className="text-xl font-bold text-foreground">{title}</h1>
            {description && (
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {children}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
