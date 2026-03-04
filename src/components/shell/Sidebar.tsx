// src/components/shell/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const nav = [
  { label: "Dashboard", href: "/app/dashboard" },
  { label: "Funcionários", href: "/app/employees" },
  { label: "Obras", href: "/app/worksites" },
  { label: "Escalas", href: "/app/schedules" },
  { label: "Relatórios", href: "/app/reports" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:gap-4 md:border-r md:border-zinc-200 md:bg-white md:px-3 md:py-4">
      <div className="px-2">
        <div className="flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-3 py-2 shadow-sm">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-zinc-900 text-white text-sm font-bold">
            WP
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-zinc-900">WorkPonto</div>
            <div className="text-xs text-zinc-500">Enterprise</div>
          </div>
        </div>
      </div>

      <nav className="px-2">
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
  );
}
