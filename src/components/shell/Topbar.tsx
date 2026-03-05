// src/components/shell/Topbar.tsx
"use client";

import { Badge } from "@/components/ui/Badge";
import { UserMenu } from "@/components/shell/UserMenu";
import { useSidebar } from "@/components/shell/SidebarContext";

export function Topbar({ title }: { title: string }) {
  const { setSidebarOpen } = useSidebar();

  return (
    <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-3 md:px-6">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            aria-label="Abrir menu"
            className="md:hidden rounded-xl border border-zinc-200 bg-white p-2.5 text-zinc-700 hover:bg-zinc-50 shrink-0"
            onClick={() => setSidebarOpen(true)}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-lg font-semibold text-zinc-900">
              {title}
            </h1>
            <Badge className="hidden sm:inline-flex">PROD</Badge>
          </div>
          <p className="truncate text-sm text-zinc-500">
            WorkPonto Enterprise — Painel administrativo
          </p>
        </div>
        </div>

        <UserMenu />
      </div>
    </header>
  );
}
