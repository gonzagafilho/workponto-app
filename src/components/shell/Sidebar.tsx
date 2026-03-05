// src/components/shell/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { useSidebar } from "@/components/shell/SidebarContext";

const nav = [
  { label: "Dashboard", href: "/app/dashboard" },
  { label: "Funcionários", href: "/app/employees" },
  { label: "Obras", href: "/app/worksites" },
  { label: "Escalas", href: "/app/schedules" },
  { label: "Relatórios", href: "/app/reports" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen } = useSidebar();

  const asideBase =
    "w-64 flex flex-col gap-4 border-r border-zinc-200 bg-white px-3 py-4";
  const asideClasses = cn(
    asideBase,
    "fixed inset-y-0 left-0 z-50 transform transition-transform duration-200 ease-out md:relative md:translate-x-0 md:inset-auto",
    sidebarOpen ? "translate-x-0 flex" : "-translate-x-full md:translate-x-0 md:flex"
  );

  return (
    <>
      <button
        type="button"
        aria-label="Fechar menu"
        className={cn(
          "fixed inset-0 z-40 bg-black/40 md:hidden",
          sidebarOpen ? "block" : "hidden"
        )}
        onClick={() => setSidebarOpen(false)}
      />
      <aside className={asideClasses}>
      <div className="flex items-center justify-between gap-2 px-2">
        <div className="flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-3 py-2 shadow-sm min-w-0">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-zinc-900 text-white text-sm font-bold">
            WP
          </div>
          <div className="leading-tight min-w-0">
            <div className="text-sm font-semibold text-zinc-900 truncate">WorkPonto</div>
            <div className="text-xs text-zinc-500">Enterprise</div>
          </div>
        </div>
        <button
          type="button"
          aria-label="Fechar menu"
          className="md:hidden rounded-xl border border-zinc-200 bg-white p-2 text-zinc-600 hover:bg-zinc-50 shrink-0"
          onClick={() => setSidebarOpen(false)}
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <nav className="px-2" onClick={() => setSidebarOpen(false)}>
        <div className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Menu
        </div>

        <div className="flex flex-col gap-1">
          {nav.map((item) => {
            const active =
              pathname === item.href || pathname?.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition",
                  active
                    ? "bg-zinc-900 text-white shadow-sm"
                    : "text-zinc-700 hover:bg-zinc-100"
                )}
              >
                <span className="h-2 w-2 rounded-full bg-current opacity-70" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="mt-auto px-2">
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-600">
          <div className="font-semibold text-zinc-900">Dica</div>
          <div className="mt-1">
            Configure unidades e geofence quando o app mobile estiver pronto.
          </div>
        </div>
      </div>
    </aside>
    </>
  );
}
